<?php

namespace App\Services\Media;

use App\Exceptions\ConversionException;
use App\Services\Files\FileStorageService;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * PdfConversionService
 *
 * Routing table:
 * ┌─────────────────────────────────┬─────────────────────────────┐
 * │ Operation / output              │ Engine                      │
 * ├─────────────────────────────────┼─────────────────────────────┤
 * │ merge / split / compress        │ Ghostscript                 │
 * │ rotate / watermark / images     │ ImageMagick                 │
 * │ unlock / protect / pages        │ Ghostscript                 │
 * │ PDF → DOCX / ODT / HTML         │ Python pdf2docx             │ ← was broken with LibreOffice
 * │ PDF → PPTX                      │ ImageMagick + Python pptx   │
 * │ DOCX/XLSX/PPTX/HTML → PDF       │ LibreOffice                 │
 * │ images → PDF                    │ ImageMagick                 │
 * │ passthrough                     │ file copy                   │
 * └─────────────────────────────────┴─────────────────────────────┘
 *
 * Root-cause note on PDF→DOCX failure:
 *   LibreOffice --convert-to docx on a PDF input is unreliable because LO
 *   routes the PDF through its Draw importer, not the Writer PDF importer,
 *   and exits with code 0 regardless of success. The output file is either
 *   absent or corrupted. Replacing this path with pdf2docx (Python) gives
 *   a proper structural Word document on all platforms.
 */
class PdfConversionService
{
    /**
     * Operations that must use pdf2docx instead of LibreOffice.
     * LibreOffice can import PDFs in Draw mode but CANNOT reliably export
     * them as editable Word documents.
     */
    private const PDF_SOURCE_DOCX_OUTPUTS = ['docx', 'odt', 'rtf', 'html', 'htm'];

    public function __construct(
        private readonly BinaryService     $binaries,
        private readonly FileStorageService $files
    ) {}

    // ─────────────────────────────────────────────────────────────────────────
    // Entry point
    // ─────────────────────────────────────────────────────────────────────────

    public function process(
        array  $tool,
        array  $inputs,
        array  $options,
        string $conversionId,
        string $workDir
    ): array {
        return match ($tool['operation']) {
            'merge'                          => $this->merge($tool, $inputs, $conversionId),
            'split'                          => $this->split($tool, $inputs[0], $conversionId, $workDir),
            'compress'                       => $this->compress($tool, $inputs[0], $options, $conversionId),
            'rotate'                         => $this->rotate($tool, $inputs[0], $options, $conversionId),
            'unlock'                         => $this->unlock($tool, $inputs[0], $options, $conversionId),
            'protect'                        => $this->protect($tool, $inputs[0], $options, $conversionId),
            'watermark'                      => $this->watermark($tool, $inputs[0], $options, $conversionId),
            'extract-pages', 'reorder-pages' => $this->selectPages($tool, $inputs[0], $options, $conversionId),
            'remove-pages'                   => $this->removePages($tool, $inputs[0], $options, $conversionId),
            'office-convert', 'office-to-pdf' => $this->dispatchOffice(
                $tool, $inputs[0], $options, $conversionId, $workDir
            ),
            'pdf-to-images' => $this->pdfToImages($tool, $inputs[0], $conversionId, $workDir),
            'images-to-pdf' => $this->imagesToPdf($tool, $inputs, $conversionId),
            'passthrough'   => $this->passthrough($tool, $inputs[0], $conversionId),
            default         => throw new ConversionException("Unsupported PDF operation [{$tool['operation']}]."),
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Office conversion dispatcher
    // Decides whether to use pdf2docx (PDF input → text-based output) or
    // LibreOffice (office input → PDF, or any direction not involving PDF→DOCX).
    // ─────────────────────────────────────────────────────────────────────────

    private function dispatchOffice(
        array  $tool,
        array  $input,
        array  $options,
        string $conversionId,
        string $workDir
    ): array {
        $inputExt  = strtolower($input['extension'] ?? '');
        $outputExt = strtolower($tool['output_extension'] ?? '');

        // PDF → PPTX: image-based approach (separate path)
        if ($inputExt === 'pdf' && $outputExt === 'pptx') {
            return $this->pdfToPptx($tool, $input, $conversionId, $workDir);
        }

        // PDF → DOCX / ODT / RTF / HTML: use pdf2docx Python library
        if ($inputExt === 'pdf' && in_array($outputExt, self::PDF_SOURCE_DOCX_OUTPUTS, true)) {
            return $this->pdfToDocxViaPython($tool, $input, $conversionId, $workDir, $outputExt);
        }

        // PDF → XLSX: not supported (document structure is lost in PDF)
        if ($inputExt === 'pdf' && $outputExt === 'xlsx') {
            throw new ConversionException(
                'Direct conversion from PDF to Excel (.xlsx) is not supported. '
                . 'Convert to Word (.docx) first, then open in Excel.'
            );
        }

        // Everything else (DOCX/XLSX/PPTX/HTML → PDF, etc.): LibreOffice
        return $this->libreOffice($tool, $input, $conversionId, $workDir);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Ghostscript operations
    // ─────────────────────────────────────────────────────────────────────────

    private function merge(array $tool, array $inputs, string $conversionId): array
    {
        $output  = $this->output($tool, $inputs[0], $conversionId, 'pdf');
        $command = [
            $this->binaries->path('ghostscript'),
            '-dBATCH', '-dNOPAUSE', '-q',
            '-sDEVICE=pdfwrite',
            '-sOutputFile=' . $output['absolute_path'],
        ];
        foreach ($inputs as $input) {
            $command[] = $input['absolute_path'];
        }

        $this->binaries->run($command);

        return $output;
    }

    private function split(array $tool, array $input, string $conversionId, string $workDir): array
    {
        $pagesDir = "{$workDir}/pages";
        File::ensureDirectoryExists($pagesDir, 0750, true);

        $this->binaries->run([
            $this->binaries->path('ghostscript'),
            '-dBATCH', '-dNOPAUSE', '-q',
            '-sDEVICE=pdfwrite',
            '-sOutputFile=' . $pagesDir . '/page-%03d.pdf',
            $input['absolute_path'],
        ]);

        $output = $this->output($tool, $input, $conversionId, 'zip');
        $this->files->zipDirectory($pagesDir, $output['absolute_path']);

        return $output;
    }

    private function compress(array $tool, array $input, array $options, string $conversionId): array
    {
        $output  = $this->output($tool, $input, $conversionId, 'pdf');
        $setting = match ($options['quality'] ?? 'medium') {
            'low'   => '/screen',
            'high'  => '/printer',
            default => '/ebook',
        };

        $this->binaries->run([
            $this->binaries->path('ghostscript'),
            '-dBATCH', '-dNOPAUSE', '-q',
            '-sDEVICE=pdfwrite',
            '-dCompatibilityLevel=1.4',
            '-dPDFSETTINGS=' . $setting,
            '-sOutputFile=' . $output['absolute_path'],
            $input['absolute_path'],
        ]);

        return $output;
    }

    private function unlock(array $tool, array $input, array $options, string $conversionId): array
    {
        $output  = $this->output($tool, $input, $conversionId, 'pdf');
        $command = [
            $this->binaries->path('ghostscript'),
            '-dBATCH', '-dNOPAUSE', '-q',
            '-sDEVICE=pdfwrite',
            '-sOutputFile=' . $output['absolute_path'],
        ];
        if (! empty($options['password'])) {
            $command[] = '-sPDFPassword=' . $options['password'];
        }
        $command[] = $input['absolute_path'];

        $this->binaries->run($command);

        return $output;
    }

    private function protect(array $tool, array $input, array $options, string $conversionId): array
    {
        if (empty($options['password'])) {
            throw new ConversionException('A password is required to protect a PDF.');
        }

        $output = $this->output($tool, $input, $conversionId, 'pdf');

        $this->binaries->run([
            $this->binaries->path('ghostscript'),
            '-dBATCH', '-dNOPAUSE', '-q',
            '-sDEVICE=pdfwrite',
            '-dEncryptionR=4', '-dKeyLength=128', '-dPermissions=-4',
            '-sUserPassword='  . $options['password'],
            '-sOwnerPassword=' . $options['password'],
            '-sOutputFile='    . $output['absolute_path'],
            $input['absolute_path'],
        ]);

        return $output;
    }

    private function selectPages(array $tool, array $input, array $options, string $conversionId): array
    {
        $pages  = $options['pages'] ?? $options['page_range'] ?? '1-';
        $output = $this->output($tool, $input, $conversionId, 'pdf');

        $this->binaries->run([
            $this->binaries->path('ghostscript'),
            '-dBATCH', '-dNOPAUSE', '-q',
            '-sDEVICE=pdfwrite',
            '-sPageList=' . $pages,
            '-sOutputFile=' . $output['absolute_path'],
            $input['absolute_path'],
        ]);

        return $output;
    }

    private function removePages(array $tool, array $input, array $options, string $conversionId): array
    {
        if (empty($options['keep_pages'])) {
            throw new ConversionException(
                'Provide keep_pages as a Ghostscript page list (e.g. "1,3-5") to specify which pages to keep.'
            );
        }

        return $this->selectPages($tool, $input, ['pages' => $options['keep_pages']], $conversionId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ImageMagick operations
    // ─────────────────────────────────────────────────────────────────────────

    private function rotate(array $tool, array $input, array $options, string $conversionId): array
    {
        $output = $this->output($tool, $input, $conversionId, 'pdf');

        $this->binaries->run([
            $this->binaries->path('imagemagick'),
            '-density', '150',
            $input['absolute_path'],
            '-rotate', (string) ((int) ($options['angle'] ?? 90)),
            $output['absolute_path'],
        ]);

        return $output;
    }

    private function watermark(array $tool, array $input, array $options, string $conversionId): array
    {
        $output = $this->output($tool, $input, $conversionId, 'pdf');
        $text   = $options['watermark'] ?? $options['signature'] ?? config('app.name');

        $this->binaries->run([
            $this->binaries->path('imagemagick'),
            '-density', '150',
            $input['absolute_path'],
            '-gravity', 'center',
            '-pointsize', '48',
            '-fill', 'rgba(0,0,0,0.25)',
            '-annotate', '45',
            $text,
            $output['absolute_path'],
        ]);

        return $output;
    }

    private function pdfToImages(array $tool, array $input, string $conversionId, string $workDir): array
    {
        $imagesDir = "{$workDir}/images";
        File::ensureDirectoryExists($imagesDir, 0750, true);

        $this->binaries->run([
            $this->binaries->path('imagemagick'),
            '-density', '200',
            $input['absolute_path'],
            '-quality', '90',
            $imagesDir . '/page-%03d.jpg',
        ]);

        $output = $this->output($tool, $input, $conversionId, 'zip');
        $this->files->zipDirectory($imagesDir, $output['absolute_path']);

        return $output;
    }

    private function imagesToPdf(array $tool, array $inputs, string $conversionId): array
    {
        $output  = $this->output($tool, $inputs[0], $conversionId, 'pdf');
        $command = [$this->binaries->path('imagemagick')];
        foreach ($inputs as $input) {
            $command[] = $input['absolute_path'];
        }
        $command[] = $output['absolute_path'];

        $this->binaries->run($command);

        return $output;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Python pdf2docx  –  PDF → DOCX / ODT / RTF / HTML
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Convert a PDF to an editable Word document using the pdf2docx Python
     * library.  This replaces the broken LibreOffice --convert-to docx path.
     *
     * pdf2docx performs a structural analysis of the PDF and reconstructs
     * paragraphs, tables, images and formatting into a proper .docx file.
     *
     * For non-DOCX targets (odt, rtf, html) we first produce a DOCX via
     * pdf2docx and then use LibreOffice to convert that DOCX to the final
     * format — LibreOffice is excellent at DOCX→other conversions.
     */
    private function pdfToDocxViaPython(
        array  $tool,
        array  $input,
        string $conversionId,
        string $workDir,
        string $outputExt
    ): array {
        $python     = $this->resolvePython();
        $scriptPath = base_path('app/Scripts/pdf_to_docx.py');

        if (! file_exists($scriptPath)) {
            throw new ConversionException(
                "pdf_to_docx.py helper script not found at: {$scriptPath}"
            );
        }

        // Step 1: PDF → DOCX (always, via pdf2docx)
        $docxPath = "{$workDir}/converted.docx";

        Log::info('[PdfConversionService] pdf2docx conversion starting.', [
            'input'      => $input['absolute_path'],
            'docx_tmp'   => $docxPath,
            'python'     => $python,
            'output_ext' => $outputExt,
        ]);

        $this->binaries->run(
            [$python, $scriptPath, $input['absolute_path'], $docxPath],
            $workDir
        );

        if (! file_exists($docxPath) || filesize($docxPath) === 0) {
            throw new ConversionException(
                "pdf2docx did not produce a DOCX file.\n"
                . "Input: {$input['absolute_path']}\n"
                . "Expected output: {$docxPath}"
            );
        }

        // Step 2: If the final target IS docx, we're done.
        if ($outputExt === 'docx') {
            $output = $this->output($tool, $input, $conversionId, 'docx');
            $this->files->copy($docxPath, $output['absolute_path']);

            return $output;
        }

        // Step 3: DOCX → ODT / RTF / HTML via LibreOffice (reliable for this direction)
        $finalTool = array_merge($tool, ['output_extension' => $outputExt]);

        // Build a fake input array pointing to the temp DOCX
        $docxInput = array_merge($input, [
            'absolute_path' => $docxPath,
            'extension'     => 'docx',
        ]);

        return $this->libreOffice($finalTool, $docxInput, $conversionId, $workDir);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LibreOffice  –  Office ↔ PDF (and DOCX → anything)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Use LibreOffice for conversions where it is reliable:
     *   DOCX / XLSX / PPTX / HTML → PDF
     *   DOCX → ODT / RTF / HTML
     *
     * DO NOT route PDF→DOCX here. Use pdfToDocxViaPython() instead.
     */
    private function libreOffice(
        array  $tool,
        array  $input,
        string $conversionId,
        string $workDir
    ): array {
        $extension = strtolower($tool['output_extension'] ?? '');
        $inputExt  = strtolower($input['extension'] ?? '');

        // Safety net: prevent routing PDF→DOCX through LibreOffice
        if ($inputExt === 'pdf' && in_array($extension, self::PDF_SOURCE_DOCX_OUTPUTS, true)) {
            Log::warning('[PdfConversionService] Attempted PDF→DOCX through LibreOffice – redirecting to pdf2docx.');
            return $this->pdfToDocxViaPython($tool, $input, '', $workDir, $extension);
        }

        // Each conversion gets its own LibreOffice user-profile directory so
        // parallel conversions never share a profile lock.
        $userProfile = 'file:///' . str_replace(
            ['\\', ' '],
            ['/', '%20'],
            $workDir
        ) . '/.lo_profile';

        $realInput   = $this->nativePath($input['absolute_path']);
        $realWorkDir = $this->nativePath($workDir);

        $command = [
            $this->binaries->path('libreoffice'),
            "-env:UserInstallation={$userProfile}",
            '--headless',
            '--nologo',
            '--nofirststartwizard',
            '--convert-to', $extension,
            '--outdir',     $realWorkDir,
            $realInput,
        ];

        Log::info('[PdfConversionService] LibreOffice conversion starting.', [
            'command'     => $command,
            'input'       => $realInput,
            'output_ext'  => $extension,
            'working_dir' => $realWorkDir,
        ]);

        $this->binaries->run($command, $realWorkDir);

        // LibreOffice exits 0 even when it fails to produce a file – scan the
        // directory for the expected output.
        $converted = collect(File::files($workDir))
            ->first(fn ($f) => strtolower($f->getExtension()) === $extension);

        if (! $converted) {
            // Gather what WAS produced for diagnostic context
            $produced = collect(File::files($workDir))
                ->map(fn ($f) => $f->getFilename())
                ->implode(', ');

            throw new ConversionException(
                "LibreOffice ran but did not produce a .{$extension} file.\n"
                . "Files in working directory: " . ($produced ?: '(none)') . "\n"
                . "Input: {$realInput}\n"
                . "This combination (" . strtoupper($inputExt) . "→" . strtoupper($extension) . ") "
                . "may not be supported by LibreOffice on this system."
            );
        }

        $output = $this->output($tool, $input, $conversionId, $extension);
        $this->files->copy($converted->getPathname(), $output['absolute_path']);

        return $output;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PDF → PPTX  (ImageMagick pages + python-pptx packaging)
    // ─────────────────────────────────────────────────────────────────────────

    private function pdfToPptx(array $tool, array $input, string $conversionId, string $workDir): array
    {
        $slidesDir = "{$workDir}/slides";
        File::ensureDirectoryExists($slidesDir, 0750, true);

        // Convert each PDF page to a PNG image
        $this->binaries->run([
            $this->binaries->path('imagemagick'),
            '-density', '150',
            $input['absolute_path'],
            '-quality', '90',
            $slidesDir . '/page-%d.png',
        ], $workDir);

        $output     = $this->output($tool, $input, $conversionId, 'pptx');
        $python     = $this->resolvePython();
        $scriptPath = base_path('app/Scripts/pdf_to_pptx.py');

        $this->binaries->run(
            [$python, $scriptPath, $slidesDir, $output['absolute_path']],
            $workDir
        );

        return $output;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Passthrough
    // ─────────────────────────────────────────────────────────────────────────

    private function passthrough(array $tool, array $input, string $conversionId): array
    {
        $output = $this->output($tool, $input, $conversionId, 'pdf');
        $this->files->copy($input['absolute_path'], $output['absolute_path']);

        return $output;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Resolve the correct Python 3 executable.
     *
     * Priority:
     *  Windows: project venv → system python.exe/python3.exe
     *  Linux:   python3 → python (both resolved via `which`)
     */
    private function resolvePython(): string
    {
        if (PHP_OS_FAMILY === 'Windows') {
            // Project venv (Laravel root / venv / Scripts / python.exe)
            $venv = base_path('venv/Scripts/python.exe');
            if (is_file($venv) && is_executable($venv)) {
                Log::debug('[PdfConversionService] Python resolved from venv.', ['path' => $venv]);
                return $venv;
            }

            foreach (['python.exe', 'python3.exe'] as $candidate) {
                exec('where ' . escapeshellarg($candidate) . ' 2>NUL', $out, $code);
                if ($code === 0 && ! empty($out[0])) {
                    $resolved = trim($out[0]);
                    Log::debug('[PdfConversionService] Python resolved via where.', ['path' => $resolved]);
                    return $resolved;
                }
                $out = [];
            }

            Log::warning('[PdfConversionService] Python not found on Windows – using bare "python" name.');
            return 'python';
        }

        // Linux / Docker / Render / Oracle Cloud
        foreach (['python3', 'python'] as $candidate) {
            exec('which ' . escapeshellarg($candidate) . ' 2>/dev/null', $out, $code);
            if ($code === 0 && ! empty($out[0])) {
                $resolved = trim($out[0]);
                Log::debug('[PdfConversionService] Python resolved via which.', ['path' => $resolved]);
                return $resolved;
            }
            $out = [];
        }

        Log::warning('[PdfConversionService] Python not found on PATH – using bare "python3" name.');
        return 'python3';
    }

    /**
     * Normalise path separators for the current OS.
     */
    private function nativePath(string $path): string
    {
        return PHP_OS_FAMILY === 'Windows'
            ? str_replace('/', DIRECTORY_SEPARATOR, $path)
            : str_replace('\\', '/', $path);
    }

    private function output(array $tool, array $input, string $conversionId, string $extension): array
    {
        $base = Str::slug(pathinfo($input['original_name'], PATHINFO_FILENAME)) ?: 'converted';

        return $this->files->outputPath($conversionId, "{$base}-{$tool['id']}.{$extension}");
    }
}

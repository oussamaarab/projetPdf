<?php

namespace App\Services\Media;

use App\Exceptions\ConversionException;
use App\Services\Files\FileStorageService;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class PdfConversionService
{
    public function __construct(
        private readonly BinaryService $binaries,
        private readonly FileStorageService $files
    ) {}

    public function process(array $tool, array $inputs, array $options, string $conversionId, string $workDir): array
    {
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
            'office-convert', 'office-to-pdf' => ($tool['output_extension'] === 'pptx')
                ? $this->pdfToPptx($tool, $inputs[0], $conversionId, $workDir)
                : $this->libreOffice($tool, $inputs[0], $conversionId, $workDir),
            'pdf-to-images'  => $this->pdfToImages($tool, $inputs[0], $conversionId, $workDir),
            'images-to-pdf'  => $this->imagesToPdf($tool, $inputs, $conversionId),
            'passthrough'    => $this->passthrough($tool, $inputs[0], $conversionId),
            default          => throw new ConversionException("Unsupported PDF operation [{$tool['operation']}]."),
        };
    }

    // -------------------------------------------------------------------------
    // PDF operations
    // -------------------------------------------------------------------------

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
            'low'  => '/screen',
            'high' => '/printer',
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

    private function rotate(array $tool, array $input, array $options, string $conversionId): array
    {
        $output = $this->output($tool, $input, $conversionId, 'pdf');
        $angle  = (int) ($options['angle'] ?? 90);

        $this->binaries->run([
            $this->binaries->path('imagemagick'),
            '-density', '150',
            $input['absolute_path'],
            '-rotate', (string) $angle,
            $output['absolute_path'],
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
            '-dEncryptionR=4',
            '-dKeyLength=128',
            '-dPermissions=-4',
            '-sUserPassword='  . $options['password'],
            '-sOwnerPassword=' . $options['password'],
            '-sOutputFile='    . $output['absolute_path'],
            $input['absolute_path'],
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
                'Provide keep_pages as a Ghostscript page list for remove-pages without a database-backed page model.'
            );
        }

        return $this->selectPages($tool, $input, ['pages' => $options['keep_pages']], $conversionId);
    }

    // -------------------------------------------------------------------------
    // LibreOffice-based operations
    // -------------------------------------------------------------------------

    private function libreOffice(array $tool, array $input, string $conversionId, string $workDir): array
    {
        $extension = $tool['output_extension'];

        if (strtolower($input['extension'] ?? '') === 'pdf' && strtolower($extension) === 'xlsx') {
            throw new ConversionException(
                'Direct conversion from PDF to Excel is not supported. Convert to Word (.docx) first.'
            );
        }

        // LibreOffice user-profile directory (prevents lock conflicts when running in parallel)
        // Use forward slashes even on Windows – LibreOffice accepts them.
        $userProfile = 'file:///' . str_replace(['\\', ' '], ['/', '%20'], $workDir) . '/.libreoffice';

        // Normalise paths for the current OS
        $realInput   = $this->nativePath($input['absolute_path']);
        $realWorkDir = $this->nativePath($workDir);

        $command = [
            $this->binaries->path('libreoffice'),
            "-env:UserInstallation={$userProfile}",
            '--headless',
            '--nologo',
            '--nofirststartwizard',
        ];

        if (strtolower($input['extension'] ?? '') === 'pdf') {
            $command[] = '--infilter=writer_pdf_import';
        }

        array_push($command, '--convert-to', $extension, '--outdir', $realWorkDir, $realInput);

        $this->binaries->run($command, $realWorkDir);

        $converted = collect(File::files($workDir))
            ->first(fn ($f) => strtolower($f->getExtension()) === strtolower($extension));

        if (! $converted) {
            throw new ConversionException('LibreOffice did not produce the expected output file.');
        }

        $output = $this->output($tool, $input, $conversionId, $extension);
        $this->files->copy($converted->getPathname(), $output['absolute_path']);

        return $output;
    }

    // -------------------------------------------------------------------------
    // PDF ↔ image helpers
    // -------------------------------------------------------------------------

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

    private function pdfToPptx(array $tool, array $input, string $conversionId, string $workDir): array
    {
        $slidesDir = "{$workDir}/slides";
        File::ensureDirectoryExists($slidesDir, 0750, true);

        // Step 1 – convert PDF pages to PNG slides via ImageMagick
        $this->binaries->run([
            $this->binaries->path('imagemagick'),
            '-density', '150',
            $input['absolute_path'],
            '-quality', '90',
            $slidesDir . '/page-%d.png',
        ], $workDir);

        $output = $this->output($tool, $input, $conversionId, 'pptx');

        // Step 2 – package PNGs into PPTX via the Python helper script
        $scriptPath = base_path('app/Scripts/pdf_to_pptx.py');
        $python     = $this->resolvePython();

        $this->binaries->run([$python, $scriptPath, $slidesDir, $output['absolute_path']], $workDir);

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

    private function passthrough(array $tool, array $input, string $conversionId): array
    {
        $output = $this->output($tool, $input, $conversionId, 'pdf');
        $this->files->copy($input['absolute_path'], $output['absolute_path']);

        return $output;
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Resolve the Python executable, preferring the venv on Windows and
     * python3 (the standard system binary) on Linux / Docker / Render.
     */
    private function resolvePython(): string
    {
        if (PHP_OS_FAMILY === 'Windows') {
            // Try project venv first (Windows layout: venv\Scripts\python.exe)
            $venvPython = base_path('venv/Scripts/python.exe');
            if (is_file($venvPython) && is_executable($venvPython)) {
                return $venvPython;
            }

            // Fall back to system python / python3
            foreach (['python.exe', 'python3.exe'] as $candidate) {
                exec('where ' . escapeshellarg($candidate) . ' 2>NUL', $out, $code);
                if ($code === 0 && ! empty($out[0])) {
                    return trim($out[0]);
                }
                $out = [];
            }

            return 'python'; // last-resort bare name
        }

        // Linux / Docker / Render
        // Prefer python3; fall back to python if that's all that's available.
        foreach (['python3', 'python'] as $candidate) {
            exec('which ' . escapeshellarg($candidate) . ' 2>/dev/null', $out, $code);
            if ($code === 0 && ! empty($out[0])) {
                return trim($out[0]);
            }
            $out = [];
        }

        return 'python3'; // let the process fail with a clear error
    }

    /**
     * Convert a path to the OS-native directory separator.
     * Always produces forward slashes on Linux; backslashes on Windows.
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

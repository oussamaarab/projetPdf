<?php

namespace App\Services\Archives;

use App\Exceptions\ConversionException;
use App\Services\Files\FileStorageService;
use App\Services\Media\BinaryService;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ArchiveConversionService
{
    public function __construct(
        private readonly BinaryService $binaries,
        private readonly FileStorageService $files
    ) {}

    public function process(array $tool, array $inputs, array $options, string $conversionId, string $workDir): array
    {
        return match ($tool['operation']) {
            'create'  => $this->create($tool, $inputs, $options, $conversionId),
            'extract' => $this->extract($tool, $inputs[0], $options, $conversionId, $workDir),
            'convert' => $this->convert($tool, $inputs[0], $options, $conversionId, $workDir),
            default   => throw new ConversionException("Unsupported archive operation [{$tool['operation']}]."),
        };
    }

    // -------------------------------------------------------------------------

    private function create(array $tool, array $inputs, array $options, string $conversionId): array
    {
        $extension = $tool['output_extension'] ?: 'zip';
        $output    = $this->output($tool, $inputs[0], $conversionId, $extension);
        $command   = [
            $this->binaries->path('seven_zip'),
            'a',
            '-t' . $extension,
            $output['absolute_path'],
        ];

        $password = $options['archive_password'] ?? $options['password'] ?? null;
        if ($password) {
            array_push($command, '-p' . $password, '-mhe=on');
        }

        foreach ($inputs as $input) {
            $command[] = $input['absolute_path'];
        }

        $this->binaries->run($command);

        return $output;
    }

    private function extract(array $tool, array $input, array $options, string $conversionId, string $workDir): array
    {
        $extractDir = "{$workDir}/extracted";
        File::ensureDirectoryExists($extractDir, 0750, true);

        $this->runExtract($input, $options, $extractDir);

        // Re-package extracted contents as ZIP
        $output  = $this->output($tool, $input, $conversionId, 'zip');
        $command = [
            $this->binaries->path('seven_zip'),
            'a', '-tzip',
            $output['absolute_path'],
            // Add every item inside extractDir – works on both OSes
            $extractDir . '/*',
        ];

        // On Windows 7-Zip needs backslashes for wildcards
        if (PHP_OS_FAMILY === 'Windows') {
            $command[array_key_last($command)] = str_replace('/', '\\', $extractDir . '\\*');
        }

        $this->binaries->run($command);

        return $output;
    }

    private function convert(array $tool, array $input, array $options, string $conversionId, string $workDir): array
    {
        $extractDir = "{$workDir}/archive-convert";
        File::ensureDirectoryExists($extractDir, 0750, true);

        $this->runExtract($input, $options, $extractDir);

        $extension = $tool['output_extension'] ?: 'zip';
        $output    = $this->output($tool, $input, $conversionId, $extension);

        $source = $extractDir . '/*';
        if (PHP_OS_FAMILY === 'Windows') {
            $source = str_replace('/', '\\', $extractDir . '\\*');
        }

        $this->binaries->run([
            $this->binaries->path('seven_zip'),
            'a',
            '-t' . $extension,
            $output['absolute_path'],
            $source,
        ]);

        return $output;
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Run the appropriate extraction command (unrar for .rar, 7z for everything else).
     */
    private function runExtract(array $input, array $options, string $extractDir): void
    {
        $binary = ($input['extension'] ?? null) === 'rar'
            ? $this->binaries->path('unrar')
            : $this->binaries->path('seven_zip');

        $isUnrar = str_contains(strtolower(basename($binary)), 'unrar');

        if ($isUnrar) {
            // unrar x -y <archive> <destination/>
            $command = [$binary, 'x', '-y', $input['absolute_path'], $extractDir . '/'];
        } else {
            // 7z x -y -o<destination> <archive>
            $command = [$binary, 'x', '-y', '-o' . $extractDir, $input['absolute_path']];
        }

        if (! empty($options['archive_password'])) {
            $command[] = '-p' . $options['archive_password'];
        }

        $this->binaries->run($command);
    }

    private function output(array $tool, array $input, string $conversionId, string $extension): array
    {
        $base = Str::slug(pathinfo($input['original_name'], PATHINFO_FILENAME)) ?: 'archive';

        return $this->files->outputPath($conversionId, "{$base}-{$tool['id']}." . strtolower($extension));
    }
}

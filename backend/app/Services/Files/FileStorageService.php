<?php

namespace App\Services\Files;

use App\Exceptions\ConversionException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;

class FileStorageService
{
    public function storeUploads(string $conversionId, array $files, array $tool): array
    {
        return array_map(function (UploadedFile $file) use ($conversionId, $tool) {
            $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'bin');
            $this->assertAllowedExtension($extension, $tool);

            $original = $this->safeFilename($file->getClientOriginalName(), $extension);
            $stored = Str::uuid()->toString().'.'.$extension;
            $path = config('conversions.storage.inputs_dir')."/{$conversionId}/{$stored}";

            Storage::disk('conversions')->putFileAs(dirname($path), $file, basename($path));

            return [
                'path' => $path,
                'absolute_path' => $this->absolutePath($path),
                'original_name' => $original,
                'extension' => $extension,
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ];
        }, $files);
    }

    public function outputPath(string $conversionId, string $filename): array
    {
        $safe = $this->safeFilename($filename);
        $path = config('conversions.storage.outputs_dir')."/{$conversionId}/{$safe}";

        Storage::disk('conversions')->makeDirectory(dirname($path));

        return [
            'path' => $path,
            'absolute_path' => $this->absolutePath($path),
            'filename' => $safe,
        ];
    }

    public function workDirectory(string $conversionId): string
    {
        $path = storage_path('app/conversions/'.config('conversions.storage.tmp_dir')."/{$conversionId}");
        File::ensureDirectoryExists($path, 0750, true);

        return $path;
    }

    public function deleteWorkDirectory(string $conversionId): void
    {
        File::deleteDirectory(storage_path('app/conversions/'.config('conversions.storage.tmp_dir')."/{$conversionId}"));
    }

    public function deleteConversionFiles(array $record): void
    {
        $disk = Storage::disk('conversions');

        foreach ($record['inputs'] ?? [] as $input) {
            if (isset($input['path'])) {
                $disk->delete($input['path']);
            }
        }

        if (! empty($record['output_path'])) {
            $disk->delete($record['output_path']);
        }

        $disk->deleteDirectory(config('conversions.storage.inputs_dir')."/{$record['id']}");
        $disk->deleteDirectory(config('conversions.storage.outputs_dir')."/{$record['id']}");
        $this->deleteWorkDirectory($record['id']);
    }

    public function zipDirectory(string $directory, string $destination): void
    {
        if (! class_exists(ZipArchive::class)) {
            throw new ConversionException('The PHP ZipArchive extension is required to package multiple output files.');
        }

        $zip = new ZipArchive();

        if ($zip->open($destination, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new ConversionException('Unable to create the output ZIP archive.');
        }

        foreach (File::allFiles($directory) as $file) {
            $zip->addFile($file->getPathname(), $file->getRelativePathname());
        }

        $zip->close();
    }

    public function copy(string $source, string $destination): void
    {
        File::ensureDirectoryExists(dirname($destination), 0750, true);

        if (! File::copy($source, $destination)) {
            throw new ConversionException('Unable to copy the converted file.');
        }
    }

    public function absolutePath(string $relativePath): string
    {
        return Storage::disk('conversions')->path($relativePath);
    }

    public function fileSize(string $relativePath): int
    {
        return Storage::disk('conversions')->size($relativePath);
    }

    private function assertAllowedExtension(string $extension, array $tool): void
    {
        $allowed = $tool['input_extensions'] ?? [];

        if (in_array('*', $allowed, true) || in_array($extension, $allowed, true)) {
            return;
        }

        throw new ConversionException(
            "Files with .{$extension} extension are not accepted by {$tool['name']}.",
            422,
            'invalid_file_type'
        );
    }

    private function safeFilename(string $filename, ?string $fallbackExtension = null): string
    {
        $extension = pathinfo($filename, PATHINFO_EXTENSION) ?: $fallbackExtension;
        $name = pathinfo($filename, PATHINFO_FILENAME) ?: 'file';
        $slug = Str::slug($name) ?: 'file';

        return $extension ? "{$slug}.".strtolower($extension) : $slug;
    }
}

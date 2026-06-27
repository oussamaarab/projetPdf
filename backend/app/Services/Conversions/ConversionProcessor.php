<?php

namespace App\Services\Conversions;

use App\Exceptions\ConversionException;
use App\Services\Archives\ArchiveConversionService;
use App\Services\Files\FileStorageService;
use App\Services\Media\AudioConversionService;
use App\Services\Media\ImageConversionService;
use App\Services\Media\PdfConversionService;
use App\Services\Media\VideoConversionService;
use Throwable;

class ConversionProcessor
{
    public function __construct(
        private readonly ConversionRepository $repository,
        private readonly ToolCatalog $catalog,
        private readonly FileStorageService $files,
        private readonly PdfConversionService $pdf,
        private readonly ImageConversionService $image,
        private readonly VideoConversionService $video,
        private readonly AudioConversionService $audio,
        private readonly ArchiveConversionService $archive
    ) {
    }

    public function process(string $conversionId): array
    {
        $record = $this->repository->update($conversionId, [
            'status' => 'processing',
            'progress' => 10,
        ]);

        $workDir = $this->files->workDirectory($conversionId);

        try {
            $tool = $this->catalog->findOrFail($record['tool']);

            $this->repository->update($conversionId, ['progress' => 25]);

            $output = match ($tool['category']) {
                'pdf' => $this->pdf->process($tool, $record['inputs'], $record['options'], $conversionId, $workDir),
                'image' => $this->image->process($tool, $record['inputs'], $record['options'], $conversionId),
                'video' => $this->video->process($tool, $record['inputs'], $record['options'], $conversionId, $workDir),
                'audio' => $this->audio->process($tool, $record['inputs'], $record['options'], $conversionId, $workDir),
                'archive' => $this->archive->process($tool, $record['inputs'], $record['options'], $conversionId, $workDir),
                default => throw new ConversionException("Unsupported category [{$tool['category']}]."),
            };

            $this->repository->update($conversionId, ['progress' => 90]);

            $completed = $this->repository->update($conversionId, [
                'status' => 'completed',
                'progress' => 100,
                'output_path' => $output['path'],
                'output_filename' => $output['filename'],
                'output_size' => $this->files->fileSize($output['path']),
                'output_mime' => $this->mimeFor($output['filename']),
                'completed_at' => now()->toISOString(),
                'error' => null,
            ]);

            return $completed;
        } catch (Throwable $exception) {
            $this->repository->update($conversionId, [
                'status' => 'failed',
                'progress' => 100,
                'error' => $exception->getMessage(),
            ]);

            throw $exception;
        } finally {
            $this->files->deleteWorkDirectory($conversionId);
        }
    }

    private function mimeFor(string $filename): string
    {
        return match (strtolower(pathinfo($filename, PATHINFO_EXTENSION))) {
            'pdf' => 'application/pdf',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            'gif' => 'image/gif',
            'ico' => 'image/x-icon',
            'bmp' => 'image/bmp',
            'tif', 'tiff' => 'image/tiff',
            'mp4' => 'video/mp4',
            'avi' => 'video/x-msvideo',
            'mov' => 'video/quicktime',
            'mkv' => 'video/x-matroska',
            'webm' => 'video/webm',
            'mp3' => 'audio/mpeg',
            'wav' => 'audio/wav',
            'aac' => 'audio/aac',
            'flac' => 'audio/flac',
            'ogg' => 'audio/ogg',
            'zip' => 'application/zip',
            '7z' => 'application/x-7z-compressed',
            'tar' => 'application/x-tar',
            default => 'application/octet-stream',
        };
    }
}

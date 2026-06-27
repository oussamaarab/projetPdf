<?php

namespace App\Services\Conversions;

use App\Jobs\ProcessConversionJob;
use App\Services\Files\FileStorageService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class ConversionService
{
    public function __construct(
        private readonly ConversionRepository $repository,
        private readonly ToolCatalog $catalog,
        private readonly FileStorageService $files
    ) {
    }

    public function create(array $user, string $toolId, array $uploadedFiles, array $options): array
    {
        $tool = $this->catalog->findOrFail($toolId);
        $id = (string) Str::uuid();
        $inputs = $this->files->storeUploads($id, $this->normalizeFiles($uploadedFiles), $tool);
        $now = now();

        $record = $this->repository->create([
            'id' => $id,
            'user_id' => $user['id'],
            'tool' => $tool['id'],
            'tool_name' => $tool['name'],
            'category' => $tool['category'],
            'status' => 'queued',
            'progress' => 0,
            'original_filename' => $inputs[0]['original_name'],
            'original_size' => array_sum(array_column($inputs, 'size')),
            'inputs' => $inputs,
            'options' => Arr::except($options, ['file', 'files', 'tool']),
            'output_path' => null,
            'output_filename' => null,
            'output_size' => null,
            'output_mime' => null,
            'error' => null,
            'created_at' => $now->toISOString(),
            'updated_at' => $now->toISOString(),
            'completed_at' => null,
            'expires_at' => $now->copy()->addMinutes(config('conversions.temp_ttl_minutes'))->toISOString(),
        ]);

        ProcessConversionJob::dispatch($id);

        return $this->repository->find($id) ?? $record;
    }

    private function normalizeFiles(array $uploadedFiles): array
    {
        return collect($uploadedFiles)
            ->flatten()
            ->filter(fn ($file) => $file instanceof UploadedFile)
            ->values()
            ->all();
    }
}

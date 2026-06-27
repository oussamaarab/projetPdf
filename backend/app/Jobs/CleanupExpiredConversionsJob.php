<?php

namespace App\Jobs;

use App\Services\Conversions\ConversionRepository;
use App\Services\Files\FileStorageService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class CleanupExpiredConversionsJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function handle(ConversionRepository $repository, FileStorageService $files): void
    {
        foreach ($repository->all() as $record) {
            if (! now()->greaterThan($record['expires_at'] ?? now()->addHour())) {
                continue;
            }

            $files->deleteConversionFiles($record);
            $repository->delete($record['id']);
        }

        foreach (Storage::disk('tokens')->files() as $path) {
            $token = json_decode(Storage::disk('tokens')->get($path), true);

            if (! is_array($token) || now()->greaterThan($token['expires_at'] ?? now()->subSecond())) {
                Storage::disk('tokens')->delete($path);
            }
        }
    }
}

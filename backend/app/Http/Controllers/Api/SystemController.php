<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Conversions\ConversionRepository;
use Illuminate\Http\JsonResponse;

class SystemController extends Controller
{
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'database' => 'disabled',
            'queue' => config('queue.default'),
            'storage' => 'private-local',
        ]);
    }

    public function adminStats(ConversionRepository $repository): JsonResponse
    {
        $records = collect($repository->all());

        return response()->json([
            'total_conversions' => $records->count(),
            'completed' => $records->where('status', 'completed')->count(),
            'processing' => $records->whereIn('status', ['queued', 'processing'])->count(),
            'failed' => $records->where('status', 'failed')->count(),
            'storage_bytes' => $records->sum(fn ($record) => (int) ($record['output_size'] ?? 0)),
        ]);
    }
}

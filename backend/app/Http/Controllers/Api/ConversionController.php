<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\ConvertFileRequest;
use App\Http\Resources\ConversionResource;
use App\Services\Conversions\ConversionRepository;
use App\Services\Conversions\ConversionService;
use App\Services\Files\FileStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ConversionController extends Controller
{
    public function __construct(
        private readonly ConversionService $conversions,
        private readonly ConversionRepository $repository,
        private readonly FileStorageService $files
    ) {
    }

    public function store(ConvertFileRequest $request): ConversionResource
    {
        $uploaded = [];

        if ($request->file('file')) {
            $uploaded[] = $request->file('file');
        }

        if ($request->file('files')) {
            $uploaded[] = $request->file('files');
        }

        $record = $this->conversions->create(
            user: $request->attributes->get('temporary_user'),
            toolId: $request->validated('tool'),
            uploadedFiles: $uploaded,
            options: $request->validated()
        );

        return new ConversionResource($record);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->attributes->get('temporary_user');
        $page = (int) $request->query('page', 1);
        $perPage = (int) $request->query('per_page', 10);
        $result = $this->repository->forUser($user['id'], $page, $perPage);

        return response()->json([
            'data' => ConversionResource::collection($result['items'])->resolve(),
            'total' => $result['total'],
            'page' => $result['page'],
            'per_page' => $result['per_page'],
        ]);
    }

    public function show(Request $request, string $conversion): ConversionResource
    {
        $record = $this->ownedRecord($request, $conversion);

        return new ConversionResource($record);
    }

    public function download(Request $request, string $conversion)
    {
        $record = $this->ownedRecord($request, $conversion);

        if (($record['status'] ?? null) !== 'completed' || empty($record['output_path'])) {
            throw new ApiException('The converted file is not ready for download.', 409, 'download_not_ready');
        }

        if (! Storage::disk('conversions')->exists($record['output_path'])) {
            throw new ApiException('The converted file has expired or was removed.', 410, 'file_expired');
        }

        return Storage::disk('conversions')->download(
            $record['output_path'],
            $record['output_filename'] ?? 'converted-file',
            ['Content-Type' => $record['output_mime'] ?? 'application/octet-stream']
        );
    }

    public function destroy(Request $request, string $conversion): JsonResponse
    {
        $record = $this->ownedRecord($request, $conversion);
        $this->files->deleteConversionFiles($record);
        $this->repository->delete($conversion);

        return response()->json([
            'message' => 'Conversion deleted.',
        ]);
    }

    private function ownedRecord(Request $request, string $id): array
    {
        $record = $this->repository->find($id);
        $user = $request->attributes->get('temporary_user');

        if (! $record) {
            throw new ApiException('Conversion not found.', 404, 'conversion_not_found');
        }

        if (($record['user_id'] ?? null) !== ($user['id'] ?? null) && ($user['role'] ?? null) !== 'admin') {
            throw new ApiException('You cannot access this conversion.', 403, 'forbidden');
        }

        return $record;
    }
}

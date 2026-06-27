<?php

namespace App\Services\Conversions;

use Illuminate\Support\Facades\Storage;

class ConversionRepository
{
    public function create(array $record): array
    {
        $this->putRecord($record);
        $this->addConversionToUser($record['user_id'], $record['id']);

        return $record;
    }

    public function update(string $id, array $attributes): array
    {
        $record = array_merge($this->findOrFail($id), $attributes, [
            'updated_at' => now()->toISOString(),
        ]);

        $this->putRecord($record);

        return $record;
    }

    public function find(string $id): ?array
    {
        $path = $this->recordPath($id);

        if (! Storage::disk('conversions')->exists($path)) {
            return null;
        }

        $record = json_decode(Storage::disk('conversions')->get($path), true);

        return is_array($record) ? $record : null;
    }

    public function findOrFail(string $id): array
    {
        return $this->find($id) ?? abort(404, 'Conversion not found.');
    }

    public function forUser(string $userId, int $page = 1, int $perPage = 10): array
    {
        $index = $this->userIndex($userId);
        $records = collect($index['conversions'] ?? [])
            ->map(fn (string $id) => $this->find($id))
            ->filter(fn (?array $record) => $record && $record['user_id'] === $userId)
            ->sortByDesc('created_at')
            ->values();

        $page = max(1, $page);
        $perPage = min(max(1, $perPage), 100);

        return [
            'items' => $records->forPage($page, $perPage)->values()->all(),
            'total' => $records->count(),
            'page' => $page,
            'per_page' => $perPage,
        ];
    }

    public function delete(string $id): ?array
    {
        $record = $this->find($id);

        if (! $record) {
            return null;
        }

        Storage::disk('conversions')->delete($this->recordPath($id));
        $this->removeConversionFromUser($record['user_id'], $id);

        return $record;
    }

    public function all(): array
    {
        $recordsDir = config('conversions.storage.records_dir');

        return collect(Storage::disk('conversions')->files($recordsDir))
            ->map(fn (string $path) => json_decode(Storage::disk('conversions')->get($path), true))
            ->filter(fn ($record) => is_array($record))
            ->values()
            ->all();
    }

    public function favorites(string $userId): array
    {
        return collect($this->userIndex($userId)['favorites'] ?? [])
            ->map(fn (string $toolId) => ['tool_id' => $toolId])
            ->values()
            ->all();
    }

    public function addFavorite(string $userId, string $toolId): array
    {
        $index = $this->userIndex($userId);
        $favorites = collect($index['favorites'] ?? [])->push($toolId)->unique()->values()->all();
        $index['favorites'] = $favorites;
        $this->putUserIndex($userId, $index);

        return ['tool_id' => $toolId];
    }

    public function removeFavorite(string $userId, string $toolId): void
    {
        $index = $this->userIndex($userId);
        $index['favorites'] = collect($index['favorites'] ?? [])
            ->reject(fn (string $favorite) => $favorite === $toolId)
            ->values()
            ->all();

        $this->putUserIndex($userId, $index);
    }

    public function statsForUser(string $userId): array
    {
        $records = collect($this->forUser($userId, 1, 1000)['items']);

        return [
            'total_conversions' => $records->count(),
            'completed' => $records->where('status', 'completed')->count(),
            'processing' => $records->whereIn('status', ['queued', 'processing'])->count(),
            'failed' => $records->where('status', 'failed')->count(),
        ];
    }

    private function putRecord(array $record): void
    {
        Storage::disk('conversions')->put(
            $this->recordPath($record['id']),
            json_encode($record, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR)
        );
    }

    private function addConversionToUser(string $userId, string $conversionId): void
    {
        $index = $this->userIndex($userId);
        $index['conversions'] = collect($index['conversions'] ?? [])
            ->push($conversionId)
            ->unique()
            ->values()
            ->all();

        $this->putUserIndex($userId, $index);
    }

    private function removeConversionFromUser(string $userId, string $conversionId): void
    {
        $index = $this->userIndex($userId);
        $index['conversions'] = collect($index['conversions'] ?? [])
            ->reject(fn (string $id) => $id === $conversionId)
            ->values()
            ->all();

        $this->putUserIndex($userId, $index);
    }

    private function userIndex(string $userId): array
    {
        $path = $this->userPath($userId);

        if (! Storage::disk('conversions')->exists($path)) {
            return [
                'conversions' => [],
                'favorites' => [],
            ];
        }

        $index = json_decode(Storage::disk('conversions')->get($path), true);

        return is_array($index) ? $index : ['conversions' => [], 'favorites' => []];
    }

    private function putUserIndex(string $userId, array $index): void
    {
        Storage::disk('conversions')->put(
            $this->userPath($userId),
            json_encode($index, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR)
        );
    }

    private function recordPath(string $id): string
    {
        return config('conversions.storage.records_dir')."/{$id}.json";
    }

    private function userPath(string $userId): string
    {
        return config('conversions.storage.users_dir')."/{$userId}.json";
    }
}

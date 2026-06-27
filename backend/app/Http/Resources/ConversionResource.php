<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource['id'],
            'tool' => $this->resource['tool'],
            'tool_name' => $this->resource['tool_name'],
            'category' => $this->resource['category'],
            'status' => $this->resource['status'],
            'progress' => $this->resource['progress'],
            'filename' => $this->resource['output_filename'] ?? $this->resource['original_filename'],
            'original_filename' => $this->resource['original_filename'],
            'size' => $this->resource['output_size'] ?? $this->resource['original_size'],
            'mime_type' => $this->resource['output_mime'] ?? null,
            'download_url' => ($this->resource['status'] ?? null) === 'completed'
                ? url("/api/conversions/{$this->resource['id']}/download")
                : null,
            'error' => $this->resource['error'] ?? null,
            'expires_at' => $this->resource['expires_at'],
            'created_at' => $this->resource['created_at'],
            'updated_at' => $this->resource['updated_at'],
            'completed_at' => $this->resource['completed_at'] ?? null,
        ];
    }
}

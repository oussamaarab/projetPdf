<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ToolResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource['id'],
            'name' => $this->resource['name'],
            'category' => $this->resource['category'],
            'operation' => $this->resource['operation'],
            'input_extensions' => $this->resource['input_extensions'],
            'output_extension' => $this->resource['output_extension'],
            'accepts_multiple' => $this->resource['accepts_multiple'] ?? false,
            'queued' => $this->resource['queued'] ?? true,
        ];
    }
}

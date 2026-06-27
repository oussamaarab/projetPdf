<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource['id'],
            'name' => $this->resource['name'] ?? null,
            'email' => $this->resource['email'] ?? null,
            'role' => $this->resource['role'] ?? 'user',
            'created_at' => $this->resource['created_at'] ?? null,
            'email_verified_at' => $this->resource['email_verified_at'] ?? null,
        ];
    }
}

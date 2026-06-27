<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ToolResource;
use App\Services\Conversions\ToolCatalog;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ToolController extends Controller
{
    public function __construct(private readonly ToolCatalog $tools)
    {
    }

    public function index(): AnonymousResourceCollection
    {
        return ToolResource::collection($this->tools->all());
    }

    public function show(string $tool): ToolResource
    {
        return new ToolResource($this->tools->findOrFail($tool));
    }

    public function category(string $category): AnonymousResourceCollection
    {
        return ToolResource::collection($this->tools->byCategory($category));
    }
}

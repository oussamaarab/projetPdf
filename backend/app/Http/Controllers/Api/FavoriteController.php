<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FavoriteRequest;
use App\Services\Conversions\ConversionRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function __construct(private readonly ConversionRepository $repository)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->attributes->get('temporary_user');

        return response()->json($this->repository->favorites($user['id']));
    }

    public function store(FavoriteRequest $request): JsonResponse
    {
        $user = $request->attributes->get('temporary_user');

        return response()->json(
            $this->repository->addFavorite($user['id'], $request->validated('tool_id')),
            201
        );
    }

    public function destroy(Request $request, string $tool): JsonResponse
    {
        $user = $request->attributes->get('temporary_user');
        $this->repository->removeFavorite($user['id'], $tool);

        return response()->json([
            'message' => 'Favorite removed.',
        ]);
    }
}

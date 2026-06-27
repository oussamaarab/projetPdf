<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\TemporaryTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly TemporaryTokenService $tokens)
    {
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $identity = $this->tokens->register($request, $request->validated());

        return response()->json([
            'message' => 'Temporary account created.',
            'token' => $identity['token'],
            'user' => (new UserResource($identity['user']))->resolve(),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $identity = $this->tokens->login($request, $request->validated());

        return response()->json([
            'message' => 'Authenticated.',
            'token' => $identity['token'],
            'user' => (new UserResource($identity['user']))->resolve(),
        ]);
    }

    public function user(Request $request): UserResource
    {
        return new UserResource($request->attributes->get('temporary_user'));
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->tokens->updateUser($request, $request->validated());

        return response()->json([
            'message' => 'Profile updated.',
            'user' => (new UserResource($user))->resolve(),
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->tokens->markPasswordChanged($request);

        return response()->json([
            'message' => 'Temporary password state updated.',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->tokens->logout($request);

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }
}

<?php

namespace App\Http\Middleware;

use App\Services\Auth\TemporaryTokenService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTemporaryToken
{
    public function __construct(private readonly TemporaryTokenService $tokens)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $identity = $this->tokens->resolveRequest($request);

        if (! $identity) {
            return response()->json([
                'message' => 'Authentication is required.',
                'error' => 'unauthenticated',
            ], 401);
        }

        $request->attributes->set('temporary_user', $identity['user']);
        $request->attributes->set('temporary_token_hash', $identity['token_hash'] ?? null);
        $request->setUserResolver(fn () => $identity['user']);

        return $next($request);
    }
}

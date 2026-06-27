<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->attributes->get('temporary_user');

        if (($user['role'] ?? null) !== 'admin') {
            return response()->json([
                'message' => 'Administrator access is required.',
                'error' => 'forbidden',
            ], 403);
        }

        return $next($request);
    }
}

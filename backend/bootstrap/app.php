<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->throttleApi('api');

        $middleware->api(prepend: [
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
        ]);

        $middleware->alias([
            'temporary.auth' => \App\Http\Middleware\EnsureTemporaryToken::class,
            'temporary.identity' => \App\Http\Middleware\ResolveTemporaryIdentity::class,
            'admin.token' => \App\Http\Middleware\EnsureAdminToken::class,
            'api.headers' => \App\Http\Middleware\ApiSecurityHeaders::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(fn ($request, $e) => $request->is('api/*') || $request->expectsJson());

        $exceptions->render(function (\App\Exceptions\ApiException $e, $request) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => $e->errorCode(),
            ], $e->statusCode());
        });

        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'message' => 'The submitted data is invalid.',
                'errors' => $e->errors(),
            ], 422);
        });
    })->create();

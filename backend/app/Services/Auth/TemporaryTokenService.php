<?php

namespace App\Services\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TemporaryTokenService
{
    private const SESSION_USER = 'temporary_auth_user';
    private const SESSION_GUEST = 'temporary_guest_user';

    public function issue(array $user): string
    {
        $token = 'ct_'.Str::random(64);
        $hash = $this->hash($token);
        $now = now();

        Storage::disk('tokens')->put($this->path($hash), json_encode([
            'token_hash' => $hash,
            'user' => $user,
            'created_at' => $now->toISOString(),
            'last_used_at' => $now->toISOString(),
            'expires_at' => $now->copy()->addMinutes(config('conversions.api_token_ttl_minutes'))->toISOString(),
        ], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));

        return $token;
    }

    public function register(Request $request, array $payload): array
    {
        $user = $this->makeUser(
            name: $payload['name'],
            email: $payload['email'],
        );

        $request->session()->put(self::SESSION_USER, $user);

        return [
            'user' => $user,
            'token' => $this->issue($user),
        ];
    }

    public function login(Request $request, array $payload): array
    {
        $name = Str::of($payload['email'])->before('@')->replace(['.', '_', '-'], ' ')->title()->toString();
        $user = $this->makeUser($name, $payload['email']);

        $request->session()->put(self::SESSION_USER, $user);

        return [
            'user' => $user,
            'token' => $this->issue($user),
        ];
    }

    public function logout(Request $request): void
    {
        if ($hash = $request->attributes->get('temporary_token_hash')) {
            Storage::disk('tokens')->delete($this->path($hash));
        }

        $request->session()->forget([self::SESSION_USER, self::SESSION_GUEST]);
    }

    public function resolveRequest(Request $request): ?array
    {
        if ($token = $request->bearerToken()) {
            $resolved = $this->resolveToken($token);

            if ($resolved) {
                $request->session()->put(self::SESSION_USER, $resolved['user']);

                return $resolved;
            }
        }

        $user = $request->session()->get(self::SESSION_USER);

        if (is_array($user) && isset($user['id'])) {
            return [
                'user' => $user,
                'token_hash' => null,
            ];
        }

        return null;
    }

    public function guest(Request $request): array
    {
        $user = $request->session()->get(self::SESSION_GUEST);

        if (! is_array($user) || ! isset($user['id'])) {
            $user = [
                'id' => 'guest_'.substr(hash('sha256', $request->session()->getId()), 0, 24),
                'name' => 'Guest',
                'email' => null,
                'role' => 'guest',
                'created_at' => now()->toISOString(),
                'email_verified_at' => null,
            ];

            $request->session()->put(self::SESSION_GUEST, $user);
        }

        return [
            'user' => $user,
            'token_hash' => null,
        ];
    }

    public function currentUser(Request $request): ?array
    {
        return $this->resolveRequest($request)['user'] ?? null;
    }

    public function updateUser(Request $request, array $attributes): array
    {
        $identity = $this->resolveRequest($request);
        $user = $identity['user'] ?? [];

        $user = array_merge($user, [
            'name' => $attributes['name'],
            'email' => $attributes['email'],
            'role' => $this->roleFor($attributes['email']),
        ]);

        $request->session()->put(self::SESSION_USER, $user);

        if (! empty($identity['token_hash'])) {
            $this->updateTokenUser($identity['token_hash'], $user);
        }

        return $user;
    }

    public function markPasswordChanged(Request $request): void
    {
        $identity = $this->resolveRequest($request);

        if (! $identity) {
            return;
        }

        $user = array_merge($identity['user'], [
            'password_changed_at' => now()->toISOString(),
        ]);

        $request->session()->put(self::SESSION_USER, $user);

        if (! empty($identity['token_hash'])) {
            $this->updateTokenUser($identity['token_hash'], $user);
        }
    }

    public function fingerprint(Request $request): string
    {
        if ($token = $request->bearerToken()) {
            return 'token:'.$this->hash($token);
        }

        if ($request->hasSession()) {
            return 'session:'.$request->session()->getId();
        }

        return 'ip:'.$request->ip().'|'.substr((string) $request->userAgent(), 0, 120);
    }

    private function resolveToken(string $token): ?array
    {
        $hash = $this->hash($token);
        $disk = Storage::disk('tokens');
        $path = $this->path($hash);

        if (! $disk->exists($path)) {
            return null;
        }

        $record = json_decode($disk->get($path), true);

        if (! is_array($record) || now()->greaterThan($record['expires_at'] ?? now()->subSecond())) {
            $disk->delete($path);

            return null;
        }

        $record['last_used_at'] = now()->toISOString();
        $disk->put($path, json_encode($record, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));

        return [
            'user' => $record['user'],
            'token_hash' => $hash,
        ];
    }

    private function updateTokenUser(string $hash, array $user): void
    {
        $disk = Storage::disk('tokens');
        $path = $this->path($hash);

        if (! $disk->exists($path)) {
            return;
        }

        $record = json_decode($disk->get($path), true);
        $record['user'] = $user;
        $record['last_used_at'] = now()->toISOString();

        $disk->put($path, json_encode($record, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));
    }

    private function makeUser(string $name, string $email): array
    {
        $normalizedEmail = Str::lower(trim($email));

        return [
            'id' => 'usr_'.substr(hash('sha256', $normalizedEmail), 0, 24),
            'name' => trim($name),
            'email' => $normalizedEmail,
            'role' => $this->roleFor($normalizedEmail),
            'created_at' => now()->toISOString(),
            'email_verified_at' => now()->toISOString(),
        ];
    }

    private function roleFor(string $email): string
    {
        $admins = array_map('strtolower', config('conversions.admin_emails', []));

        return in_array(strtolower($email), $admins, true) ? 'admin' : 'user';
    }

    private function hash(string $token): string
    {
        return hash('sha256', $token);
    }

    private function path(string $hash): string
    {
        return "{$hash}.json";
    }
}

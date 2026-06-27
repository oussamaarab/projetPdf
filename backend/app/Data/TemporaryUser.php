<?php

namespace App\Data;

final class TemporaryUser
{
    public function __construct(
        public readonly string $id,
        public readonly ?string $name,
        public readonly ?string $email,
        public readonly string $role,
        public readonly string $createdAt,
        public readonly ?string $emailVerifiedAt = null
    ) {
    }

    public static function fromArray(array $user): self
    {
        return new self(
            id: (string) $user['id'],
            name: $user['name'] ?? null,
            email: $user['email'] ?? null,
            role: $user['role'] ?? 'user',
            createdAt: $user['created_at'] ?? now()->toISOString(),
            emailVerifiedAt: $user['email_verified_at'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'created_at' => $this->createdAt,
            'email_verified_at' => $this->emailVerifiedAt,
        ];
    }
}

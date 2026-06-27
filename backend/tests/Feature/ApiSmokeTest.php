<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiSmokeTest extends TestCase
{
    public function test_tools_are_exposed_without_a_database(): void
    {
        $response = $this->getJson('/api/tools');

        $response
            ->assertOk()
            ->assertJsonFragment(['id' => 'merge-pdf'])
            ->assertJsonFragment(['id' => 'compress-video']);
    }

    public function test_temporary_token_authenticates_user_without_a_database(): void
    {
        $registration = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'user@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $registration
            ->assertCreated()
            ->assertJsonPath('user.email', 'user@example.test')
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);

        $token = $registration->json('token');

        $this->withToken($token)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('email', 'user@example.test');
    }
}

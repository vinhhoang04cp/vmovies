<?php

namespace Tests\Unit\Services;

use App\Exceptions\AuthenticationException;
use App\Exceptions\ValidationException;
use App\Models\Role;
use App\Models\User;
use App\Services\Auth\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    private AuthService $authService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authService = app(AuthService::class);

        // Create roles
        Role::create(['name' => 'admin', 'display_name' => 'Administrator']);
        Role::create(['name' => 'user', 'display_name' => 'User']);
    }

    public function test_user_can_login_with_correct_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'status' => 'active',
        ]);

        $result = $this->authService->login('test@example.com', 'password');

        $this->assertArrayHasKey('user', $result);
        $this->assertArrayHasKey('token', $result);
        $this->assertEquals($user->id, $result['user']['id']);
    }

    public function test_login_fails_with_invalid_email(): void
    {
        $this->expectException(AuthenticationException::class);
        $this->authService->login('nonexistent@example.com', 'password');
    }

    public function test_login_fails_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $this->expectException(AuthenticationException::class);
        $this->authService->login('test@example.com', 'wrongpassword');
    }

    public function test_login_fails_for_banned_user(): void
    {
        User::factory()->create([
            'email' => 'banned@example.com',
            'password' => bcrypt('password'),
            'status' => 'banned',
        ]);

        $this->expectException(AuthenticationException::class);
        $this->authService->login('banned@example.com', 'password');
    }

    public function test_user_can_register(): void
    {
        $data = [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'password123',
        ];

        $result = $this->authService->register($data);

        $this->assertArrayHasKey('user', $result);
        $this->assertArrayHasKey('token', $result);
        $this->assertEquals('New User', $result['user']['name']);
        $this->assertEquals('new@example.com', $result['user']['email']);

        $this->assertDatabaseHas('users', [
            'email' => 'new@example.com',
        ]);
    }

    public function test_registration_fails_with_duplicate_email(): void
    {
        User::factory()->create([
            'email' => 'existing@example.com',
        ]);

        $data = [
            'name' => 'New User',
            'email' => 'existing@example.com',
            'password' => 'password123',
        ];

        $this->expectException(ValidationException::class);
        $this->authService->register($data);
    }

    public function test_logout_revokes_all_tokens(): void
    {
        $user = User::factory()->create();
        $token1 = $user->createToken('token1')->plainTextToken;
        $token2 = $user->createToken('token2')->plainTextToken;

        $this->authService->logout($user);

        $this->assertEquals(0, $user->tokens()->count());
    }

    public function test_refresh_token_generates_new_token(): void
    {
        $user = User::factory()->create();
        $oldToken = $user->createToken('api-token', ['*'])->plainTextToken;

        // Simulate the old token being the current access token
        $result = $this->authService->refreshToken($user);

        $this->assertArrayHasKey('token', $result);
        $this->assertNotEquals($oldToken, $result['token']);
    }

    public function test_get_current_user_returns_user_data(): void
    {
        $role = Role::first();
        $user = User::factory()->create();
        $user->role_id = $role->id;
        $user->save();

        $result = $this->authService->getCurrentUser($user);

        $this->assertEquals($user->id, $result['id']);
        $this->assertEquals($user->name, $result['name']);
        $this->assertEquals($user->email, $result['email']);
        $this->assertArrayHasKey('role', $result);
        $this->assertArrayHasKey('permissions', $result['role']);
    }
}

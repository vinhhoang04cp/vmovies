<?php

namespace App\Services\Auth;

use App\Exceptions\AuthenticationException;
use App\Exceptions\ValidationException;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * Login user and return token.
     *
     * @throws AuthenticationException
     * @throws ValidationException
     */
    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            throw new AuthenticationException(
                'Email not found',
                'EMAIL_NOT_FOUND'
            );
        }

        if ($user->isBanned()) {
            throw new AuthenticationException(
                'Your account has been banned',
                'ACCOUNT_BANNED'
            );
        }

        if (! Hash::check($password, $user->password)) {
            throw new AuthenticationException(
                'Invalid password',
                'INVALID_PASSWORD'
            );
        }

        return $this->generateTokenResponse($user);
    }

    /**
     * Register a new user.
     *
     * @throws ValidationException
     */
    public function register(array $data): array
    {
        // Validate unique email
        if (User::where('email', $data['email'])->exists()) {
            throw new ValidationException(
                ['email' => 'This email is already registered'],
                'Email already registered'
            );
        }

        // Create user
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'status' => 'active',
        ]);

        // Assign default user role
        $userRole = Role::where('name', 'user')->first();
        if ($userRole) {
            $user->role_id = $userRole->id;
            $user->save();
        }

        return $this->generateTokenResponse($user);
    }

    /**
     * Generate token response for authenticated user.
     */
    public function generateTokenResponse(User $user): array
    {
        $token = $user->createToken('api-token', ['*'])->plainTextToken;

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
                'status' => $user->status,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                    'display_name' => $user->role->display_name,
                ] : null,
                'is_admin' => $user->isAdmin(),
                'created_at' => $user->created_at,
            ],
            'token' => $token,
        ];
    }

    /**
     * Get current authenticated user.
     */
    public function getCurrentUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar_url' => $user->avatar_url,
            'status' => $user->status,
            'role' => $user->role ? [
                'id' => $user->role->id,
                'name' => $user->role->name,
                'display_name' => $user->role->display_name,
                'permissions' => $user->role->permissions()->pluck('name')->toArray(),
            ] : null,
            'is_admin' => $user->isAdmin(),
            'created_at' => $user->created_at,
        ];
    }

    /**
     * Logout user (revoke all tokens).
     */
    public function logout(User $user): bool
    {
        $user->tokens()->delete();
        return true;
    }

    /**
     * Refresh token.
     */
    public function refreshToken(User $user): array
    {
        // Revoke current token
        $user->currentAccessToken()->delete();

        // Generate new token
        $token = $user->createToken('api-token', ['*'])->plainTextToken;

        return [
            'token' => $token,
        ];
    }
}


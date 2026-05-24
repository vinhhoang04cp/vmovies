<?php

namespace App\Services\Auth;

use App\Exceptions\ApiException;
use App\Exceptions\AuthenticationException;
use App\Exceptions\ValidationException;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthService
{
    /**
     * Login user and return token.
     *
     * @throws AuthenticationException
     * @throws ValidationException
     * @throws ApiException
     */
    public function login(string $email, string $password): array
    {
        $throttleKey = Str::transliterate(Str::lower($email).'|'.request()->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw new ApiException(
                "Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau {$seconds} giây.",
                429,
                'TOO_MANY_ATTEMPTS'
            );
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            RateLimiter::hit($throttleKey, 60);
            throw new AuthenticationException(
                'Email hoặc mật khẩu không đúng',
                'INVALID_CREDENTIALS'
            );
        }

        if ($user->isBanned()) {
            throw new AuthenticationException(
                'Tài khoản của bạn đã bị khóa',
                'ACCOUNT_BANNED'
            );
        }

        if (! Hash::check($password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);
            throw new AuthenticationException(
                'Email hoặc mật khẩu không đúng',
                'INVALID_CREDENTIALS'
            );
        }

        RateLimiter::clear($throttleKey);

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
        $user->loadMissing('role');
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
        $user->loadMissing('role.permissions');

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
                'permissions' => $user->role->permissions->pluck('name')->toArray(),
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

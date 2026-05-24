<?php

namespace App\Http\Controllers\Auth;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\Auth\AuthService;
use App\Traits\HasJsonResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    use HasJsonResponse;

    public function __construct(
        private AuthService $authService
    ) {}

    /**
     * Login user and return authentication token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $data = $this->authService->login(
                $request->validated()['email'],
                $request->validated()['password']
            );

            $cookie = cookie(
                'auth_token',
                $data['token'],
                10080, // 7 days in minutes
                null,
                null,
                false, // secure
                true, // httpOnly
                false, // raw
                'Lax' // sameSite
            );

            return $this->successResponse(
                [
                    'user' => $data['user'],
                    'token' => $data['token'],
                ],
                'Login successful'
            )->withCookie($cookie);
        } catch (\Exception $e) {
            Log::error('Login error', [
                'email' => $request->validated()['email'] ?? null,
                'exception' => $e->getMessage(),
            ]);

            if ($e instanceof ApiException) {
                return $e->render($request);
            }

            return $this->errorResponse(
                'An error occurred during login',
                500
            );
        }
    }

    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $data = $this->authService->register($request->validated());

            $cookie = cookie(
                'auth_token',
                $data['token'],
                10080, // 7 days in minutes
                null,
                null,
                false, // secure
                true, // httpOnly
                false, // raw
                'Lax' // sameSite
            );

            return $this->createdResponse(
                [
                    'user' => $data['user'],
                    'token' => $data['token'],
                ],
                'Registration successful'
            )->withCookie($cookie);
        } catch (\Exception $e) {
            Log::error('Registration error', [
                'email' => $request->validated()['email'] ?? null,
                'exception' => $e->getMessage(),
            ]);

            if ($e instanceof ApiException) {
                return $e->render($request);
            }

            return $this->errorResponse(
                'An error occurred during registration',
                500
            );
        }
    }

    /**
     * Get current authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (! $user) {
                return $this->unauthorizedResponse('User not authenticated');
            }

            $userData = $this->authService->getCurrentUser($user);

            return $this->successResponse(
                $userData,
                'User retrieved successfully'
            );
        } catch (\Exception $e) {
            Log::error('Get current user error', [
                'exception' => $e->getMessage(),
            ]);

            return $this->errorResponse(
                'An error occurred while retrieving user data',
                500
            );
        }
    }

    /**
     * Logout user (revoke token).
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (! $user) {
                return $this->unauthorizedResponse('User not authenticated');
            }

            $this->authService->logout($user);

            $cookie = cookie()->forget('auth_token');

            return $this->successResponse(
                null,
                'Logout successful'
            )->withCookie($cookie);
        } catch (\Exception $e) {
            Log::error('Logout error', [
                'exception' => $e->getMessage(),
            ]);

            return $this->errorResponse(
                'An error occurred during logout',
                500
            );
        }
    }

    /**
     * Refresh authentication token.
     */
    public function refresh(Request $request): JsonResponse
    {
        try {
            $tokenStr = $request->bearerToken();
            if (!$tokenStr && $request->hasCookie('auth_token')) {
                $tokenStr = $request->cookie('auth_token');
            }

            if (!$tokenStr) {
                return $this->unauthorizedResponse('Token not provided');
            }

            $model = \Laravel\Sanctum\PersonalAccessToken::findToken($tokenStr);
            if (!$model) {
                return $this->unauthorizedResponse('Invalid token');
            }

            $user = $model->tokenable;
            if (!$user) {
                return $this->unauthorizedResponse('User not found');
            }

            $model->delete();

            $newToken = $user->createToken('api-token', ['*'])->plainTextToken;

            $cookie = cookie(
                'auth_token',
                $newToken,
                10080, // 7 days
                null,
                null,
                false,
                true,
                false,
                'Lax'
            );

            return $this->successResponse(
                [
                    'token' => $newToken,
                ],
                'Token refreshed successfully'
            )->withCookie($cookie);
        } catch (\Exception $e) {
            Log::error('Refresh token error', [
                'exception' => $e->getMessage(),
            ]);

            return $this->errorResponse(
                'An error occurred while refreshing token',
                500
            );
        }
    }
}

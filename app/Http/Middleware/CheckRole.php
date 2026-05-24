<?php

namespace App\Http\Middleware;

use App\Exceptions\AuthorizationException;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @throws AuthorizationException
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();
        if (! $user) {
            throw new AuthorizationException(
                'User is not authenticated',
                'NOT_AUTHENTICATED'
            );
        }

        if (!$user->relationLoaded('role')) {
            $user->load('role.permissions');
        }

        $allowedRoles = explode('|', $role);

        if (! $request->user()->hasAnyRole($allowedRoles)) {
            throw new AuthorizationException(
                sprintf('You do not have required role to access this resource'),
                'ROLE_DENIED'
            );
        }

        return $next($request);
    }
}

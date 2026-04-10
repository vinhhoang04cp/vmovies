<?php

namespace App\Http\Middleware;

use App\Exceptions\AuthorizationException;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @throws AuthorizationException
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        if (! $request->user()) {
            throw new AuthorizationException(
                'User is not authenticated',
                'NOT_AUTHENTICATED'
            );
        }

        if (! $request->user()->hasPermission($permission)) {
            throw new AuthorizationException(
                sprintf('You do not have "%s" permission', $permission),
                'PERMISSION_DENIED'
            );
        }

        return $next($request);
    }
}


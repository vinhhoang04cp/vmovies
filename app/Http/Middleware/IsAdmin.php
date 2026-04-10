<?php

namespace App\Http\Middleware;

use App\Exceptions\AuthorizationException;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @throws AuthorizationException
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            throw new AuthorizationException(
                'User is not authenticated',
                'NOT_AUTHENTICATED'
            );
        }

        if (! $request->user()->isAdmin()) {
            throw new AuthorizationException(
                'Only administrators can access this resource',
                'ADMIN_ONLY'
            );
        }

        return $next($request);
    }
}


<?php

namespace App\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class AuthenticationException extends ApiException
{
    public function __construct(
        string $message = 'Authentication failed',
        ?string $errorCode = null
    ) {
        parent::__construct(
            $message,
            Response::HTTP_UNAUTHORIZED,
            $errorCode ?? 'AUTHENTICATION_FAILED'
        );
    }
}


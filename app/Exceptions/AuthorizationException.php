<?php

namespace App\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class AuthorizationException extends ApiException
{
    public function __construct(
        string $message = 'You do not have permission to access this resource',
        ?string $errorCode = null
    ) {
        parent::__construct(
            $message,
            Response::HTTP_FORBIDDEN,
            $errorCode ?? 'AUTHORIZATION_FAILED'
        );
    }
}


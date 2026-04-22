<?php

namespace App\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class ValidationException extends ApiException
{
    protected array $errors = [];

    public function __construct(
        array $errors,
        string $message = 'Validation failed'
    ) {
        parent::__construct(
            $message,
            Response::HTTP_UNPROCESSABLE_ENTITY,
            'VALIDATION_ERROR'
        );
        $this->errors = $errors;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function render($request)
    {
        return response()->json([
            'success' => false,
            'message' => $this->message,
            'error_code' => $this->errorCode,
            'errors' => $this->errors,
        ], $this->statusCode);
    }
}

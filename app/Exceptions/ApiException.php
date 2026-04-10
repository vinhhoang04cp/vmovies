<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiException extends Exception
{
    protected int $statusCode = Response::HTTP_INTERNAL_SERVER_ERROR;
    protected string $errorCode = 'INTERNAL_SERVER_ERROR';

    public function __construct(
        string $message = 'An error occurred',
        int $statusCode = Response::HTTP_INTERNAL_SERVER_ERROR,
        string $errorCode = 'INTERNAL_SERVER_ERROR',
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, 0, $previous);
        $this->statusCode = $statusCode;
        $this->errorCode = $errorCode;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->message,
            'error_code' => $this->errorCode,
            'errors' => null,
        ], $this->statusCode);
    }
}


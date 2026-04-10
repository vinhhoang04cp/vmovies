<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

trait HasJsonResponse
{
    /**
     * Return a success JSON response.
     */
    protected function successResponse(
        mixed $data = null,
        string $message = 'Success',
        int $statusCode = SymfonyResponse::HTTP_OK
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    /**
     * Return a created JSON response.
     */
    protected function createdResponse(
        mixed $data = null,
        string $message = 'Resource created successfully'
    ): JsonResponse {
        return $this->successResponse($data, $message, SymfonyResponse::HTTP_CREATED);
    }

    /**
     * Return an error JSON response.
     */
    protected function errorResponse(
        string $message = 'An error occurred',
        int $statusCode = SymfonyResponse::HTTP_INTERNAL_SERVER_ERROR,
        ?array $errors = null,
        ?string $errorCode = null
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error_code' => $errorCode,
            'errors' => $errors,
        ], $statusCode);
    }

    /**
     * Return a not found response.
     */
    protected function notFoundResponse(string $message = 'Resource not found'): JsonResponse
    {
        return $this->errorResponse(
            $message,
            SymfonyResponse::HTTP_NOT_FOUND,
            null,
            'NOT_FOUND'
        );
    }

    /**
     * Return an unauthorized response.
     */
    protected function unauthorizedResponse(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->errorResponse(
            $message,
            SymfonyResponse::HTTP_UNAUTHORIZED,
            null,
            'UNAUTHORIZED'
        );
    }

    /**
     * Return a forbidden response.
     */
    protected function forbiddenResponse(string $message = 'Forbidden'): JsonResponse
    {
        return $this->errorResponse(
            $message,
            SymfonyResponse::HTTP_FORBIDDEN,
            null,
            'FORBIDDEN'
        );
    }

    /**
     * Return a validation error response.
     */
    protected function validationErrorResponse(array $errors, string $message = 'Validation failed'): JsonResponse
    {
        return $this->errorResponse(
            $message,
            SymfonyResponse::HTTP_UNPROCESSABLE_ENTITY,
            $errors,
            'VALIDATION_ERROR'
        );
    }
}


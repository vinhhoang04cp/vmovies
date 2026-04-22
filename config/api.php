<?php

return [
    /*
    |--------------------------------------------------------------------------
    | API Response Configuration
    |--------------------------------------------------------------------------
    */

    'response' => [
        'include_request_id' => true,
        'include_timestamp' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | API Pagination
    |--------------------------------------------------------------------------
    */

    'pagination' => [
        'per_page' => 15,
        'max_per_page' => 100,
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    */

    'rate_limit' => [
        'enabled' => true,
        'requests_per_minute' => 60,
    ],

    /*
    |--------------------------------------------------------------------------
    | API Tokens Configuration
    |--------------------------------------------------------------------------
    */

    'tokens' => [
        'expiration' => null, // null means no expiration
        'abilities' => ['*'], // Default abilities for all tokens
    ],

    /*
    |--------------------------------------------------------------------------
    | CORS Configuration
    |--------------------------------------------------------------------------
    */

    'cors' => [
        'allowed_origins' => explode(',', env('API_CORS_ALLOWED_ORIGINS', '*')),
        'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        'allowed_headers' => ['*'],
        'exposed_headers' => [],
        'max_age' => 86400,
        'allow_credentials' => true,
    ],
];

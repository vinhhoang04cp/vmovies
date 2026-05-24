<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => config('api.cors.allowed_methods', ['*']),

    'allowed_origins' => config('api.cors.allowed_origins', ['*']),

    'allowed_origins_patterns' => [],

    'allowed_headers' => config('api.cors.allowed_headers', ['*']),

    'exposed_headers' => config('api.cors.exposed_headers', []),

    'max_age' => config('api.cors.max_age', 0),

    'supports_credentials' => config('api.cors.allow_credentials', false),

];

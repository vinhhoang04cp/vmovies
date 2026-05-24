<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Stateful Domains
    |--------------------------------------------------------------------------
    |
    | Requests from the following domains / hosts will receive stateful API
    | authentication cookies. Typically, these should include your local
    | and production domains which access your API via your frontend.
    |
    */

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
        env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
    ))),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Guards
    |--------------------------------------------------------------------------
    |
    | This array contains the guards that Sanctum will check for stateful
    | request authentication. You may add or remove guards from this list
    | as necessary for your unique application requirements.
    |
    */

    'guard' => [
        'web',
    ],

    /*
    |--------------------------------------------------------------------------
    | Expiration Minutes
    |--------------------------------------------------------------------------
    |
    | This value controls the number of minutes an issued token will be
    | considered valid. If this value is null, personal access tokens do
    | not expire. This won't impact the lifetime of first-party sessions.
    |
    */

    'expiration' => 10080, // 7 days in minutes

    /*
    |--------------------------------------------------------------------------
    | Token Naming Cool Down
    |--------------------------------------------------------------------------
    |
    | This value controls the number of seconds a token naming request must
    | wait before it can be processed again. This helps prevent spamming
    | of token naming requests from malicious users.
    |
    */

    'token_naming_cool_down' => 10,

    /*
    |--------------------------------------------------------------------------
    | Sanctum Middleware
    |--------------------------------------------------------------------------
    |
    | When protecting your API routes with Sanctum, you may customize the
    | middleware that Sanctum will use to sanitize the incoming requests
    | from your stateful SPA.
    |
    */

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'verify_csrf_token' => Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
    ],

];

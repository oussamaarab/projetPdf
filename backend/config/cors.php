<?php

/**
 * CORS configuration
 *
 * ALLOWED_ORIGINS env var accepts a comma-separated list:
 *   ALLOWED_ORIGINS=https://app.onrender.com,https://converthub.com
 *
 * Falls back to FRONTEND_URL and APP_URL if ALLOWED_ORIGINS is not set.
 */

$extraOrigins = array_filter(
    array_map('trim', explode(',', (string) env('ALLOWED_ORIGINS', '')))
);

$defaultOrigins = array_filter([
    env('FRONTEND_URL', 'http://localhost:5173'),
    env('APP_URL', 'http://localhost'),
]);

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_unique(
        array_merge($extraOrigins ?: $defaultOrigins, $defaultOrigins)
    )),

    // Use patterns for wildcard Render preview domains, e.g.:
    //   ALLOWED_ORIGINS_PATTERNS=https://.*\.onrender\.com
    'allowed_origins_patterns' => array_filter(
        array_map('trim', explode(',', (string) env('ALLOWED_ORIGINS_PATTERNS', '')))
    ),

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Content-Disposition'],

    'max_age' => 3600,

    'supports_credentials' => true,

];

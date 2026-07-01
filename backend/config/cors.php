<?php

/**
 * CORS configuration
 *
 * ALLOWED_ORIGINS env var accepts a comma-separated list:
 *   ALLOWED_ORIGINS=https://app.onrender.com,https://converthub.com
 *
 * Falls back to FRONTEND_URL and APP_URL when ALLOWED_ORIGINS is not set.
 *
 * Trailing slashes are stripped automatically so
 * "https://example.com/" and "https://example.com" both work.
 */

// Helper: strip trailing slash and blank values
$clean = fn (string $v): string => rtrim(trim($v), '/');

$extraOrigins = array_values(array_filter(
    array_map($clean, explode(',', (string) env('ALLOWED_ORIGINS', '')))
));

$defaultOrigins = array_values(array_filter([
    $clean((string) env('FRONTEND_URL', '')),
    $clean((string) env('APP_URL', '')),
]));

// Always allow local dev out of the box
$localOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
];

$allowedOrigins = array_values(array_unique(array_filter(
    array_merge($extraOrigins ?: $defaultOrigins, $defaultOrigins, $localOrigins)
)));

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $allowedOrigins,

    // Wildcard pattern support, e.g. for Render preview URLs:
    //   ALLOWED_ORIGINS_PATTERNS=https://.*\.onrender\.com
    'allowed_origins_patterns' => array_values(array_filter(
        array_map('trim', explode(',', (string) env('ALLOWED_ORIGINS_PATTERNS', '')))
    )),

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Content-Disposition'],

    'max_age' => 3600,

    'supports_credentials' => true,

];

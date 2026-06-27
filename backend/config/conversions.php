<?php

return [
    'max_upload_mb' => (int) env('CONVERSION_MAX_UPLOAD_MB', 250),
    'temp_ttl_minutes' => (int) env('CONVERSION_TEMP_TTL_MINUTES', 120),
    'process_timeout' => (int) env('CONVERSION_PROCESS_TIMEOUT', 900),
    'api_token_ttl_minutes' => (int) env('API_TOKEN_TTL_MINUTES', 120),
    'admin_emails' => array_filter(array_map('trim', explode(',', (string) env('ADMIN_EMAILS', '')))),

    'storage' => [
        'disk' => 'conversions',
        'inputs_dir' => 'inputs',
        'outputs_dir' => 'outputs',
        'records_dir' => 'records',
        'users_dir' => 'users',
        'tmp_dir' => 'tmp',
    ],

    'binaries' => [
        'ffmpeg' => env('FFMPEG_BINARY', 'ffmpeg'),
        'ffprobe' => env('FFPROBE_BINARY', 'ffprobe'),
        'ghostscript' => env('GHOSTSCRIPT_BINARY', 'gs'),
        'libreoffice' => env('LIBREOFFICE_BINARY', 'soffice'),
        'imagemagick' => env('IMAGEMAGICK_BINARY', 'magick'),
        'seven_zip' => env('SEVEN_ZIP_BINARY', '7z'),
        'unrar' => env('UNRAR_BINARY', 'unrar'),
    ],
];

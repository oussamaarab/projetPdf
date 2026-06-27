<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConversionController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\SystemController;
use App\Http\Controllers\Api\ToolController;
use Illuminate\Support\Facades\Route;

Route::middleware('api.headers')->group(function () {
    Route::get('/health', [SystemController::class, 'health']);

    Route::get('/tools', [ToolController::class, 'index']);
    Route::get('/tools/category/{category}', [ToolController::class, 'category']);
    Route::get('/tools/{tool}', [ToolController::class, 'show']);

    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:api');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:api');

    Route::middleware('temporary.identity')->group(function () {
        Route::post('/convert', [ConversionController::class, 'store']);
        Route::post('/tools/{tool}/convert', [ConversionController::class, 'store']);
        Route::get('/conversions/{conversion}', [ConversionController::class, 'show']);
        Route::get('/conversions/{conversion}/download', [ConversionController::class, 'download']);
        Route::delete('/conversions/{conversion}', [ConversionController::class, 'destroy']);

        foreach ([
            'pdf/merge' => 'merge-pdf',
            'pdf/split' => 'split-pdf',
            'pdf/compress' => 'compress-pdf',
            'pdf/rotate' => 'rotate-pdf',
            'pdf/unlock' => 'unlock-pdf',
            'pdf/protect' => 'protect-pdf',
            'pdf/watermark' => 'watermark-pdf',
            'pdf/remove-pages' => 'remove-pages',
            'pdf/extract-pages' => 'extract-pages',
            'pdf/reorder-pages' => 'reorder-pages',
            'pdf/to-word' => 'pdf-to-word',
            'pdf/to-powerpoint' => 'pdf-to-powerpoint',
            'pdf/to-jpg' => 'pdf-to-jpg',
            'word/to-pdf' => 'word-to-pdf',
            'excel/to-pdf' => 'excel-to-pdf',
            'powerpoint/to-pdf' => 'powerpoint-to-pdf',
            'image/jpg-to-png' => 'jpg-to-png',
            'image/png-to-jpg' => 'png-to-jpg',
            'image/jpg-to-webp' => 'jpg-to-webp',
            'image/webp-to-jpg' => 'webp-to-jpg',
            'image/jpg-to-svg' => 'jpg-to-svg',
            'image/svg-to-jpg' => 'svg-to-jpg',
            'image/resize' => 'resize-image',
            'image/compress' => 'compress-image',
            'image/crop' => 'crop-image',
            'image/rotate' => 'rotate-image',
            'image/flip' => 'flip-image',
            'image/watermark' => 'watermark-image',
            'image/remove-background' => 'remove-background',
            'image/ico' => 'image-to-ico',
            'image/bmp' => 'png-to-bmp',
            'image/tiff' => 'jpg-to-tiff',
            'image/optimize' => 'optimize-image',
            'video/mp4-to-avi' => 'mp4-to-avi',
            'video/avi-to-mp4' => 'avi-to-mp4',
            'video/mp4-to-mov' => 'mp4-to-mov',
            'video/mp4-to-mkv' => 'mp4-to-mkv',
            'video/mp4-to-webm' => 'mp4-to-webm',
            'video/compress' => 'compress-video',
            'video/trim' => 'trim-video',
            'video/rotate' => 'rotate-video',
            'video/extract-frames' => 'extract-frames',
            'video/resolution' => 'change-resolution',
            'video/fps' => 'change-fps',
            'video/merge' => 'merge-videos',
            'video/extract-audio' => 'extract-audio',
            'video/gif' => 'video-to-gif',
            'audio/mp3-to-wav' => 'mp3-to-wav',
            'audio/wav-to-mp3' => 'wav-to-mp3',
            'audio/mp3-to-aac' => 'mp3-to-aac',
            'audio/mp3-to-flac' => 'mp3-to-flac',
            'audio/mp3-to-ogg' => 'mp3-to-ogg',
            'audio/compress' => 'compress-audio',
            'audio/merge' => 'merge-audio',
            'audio/trim' => 'trim-audio',
            'audio/normalize' => 'normalize-audio',
            'audio/bitrate' => 'change-bitrate',
            'audio/metadata' => 'audio-metadata',
            'archive/zip' => 'zip-files',
            'archive/extract' => 'extract-archive',
            'archive/rar-to-zip' => 'rar-to-zip',
            'archive/7z-to-zip' => '7z-to-zip',
            'archive/tar-to-zip' => 'tar-to-zip',
            'archive/tar-gz-to-zip' => 'tar-gz-to-zip',
            'archive/compress' => 'compress-archive',
            'archive/password-protected' => 'password-protected-archive',
        ] as $uri => $tool) {
            Route::post($uri, [ConversionController::class, 'store'])->defaults('tool', $tool);
        }
    });

    Route::middleware('temporary.auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::put('/user/profile', [AuthController::class, 'updateProfile']);
        Route::put('/user/password', [AuthController::class, 'changePassword']);

        Route::get('/conversions', [ConversionController::class, 'index']);

        Route::get('/favorites', [FavoriteController::class, 'index']);
        Route::post('/favorites', [FavoriteController::class, 'store']);
        Route::delete('/favorites/{tool}', [FavoriteController::class, 'destroy']);
    });

    Route::middleware(['temporary.auth', 'admin.token'])->group(function () {
        Route::get('/admin/stats', [SystemController::class, 'adminStats']);
    });
});

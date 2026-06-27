<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name'),
        'status' => 'ok',
        'api' => url('/api'),
    ]);
});

Route::get('/sanctum/csrf-cookie', function () {
    return response()->noContent();
})->middleware('web');

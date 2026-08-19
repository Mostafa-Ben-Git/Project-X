<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Routes that are not part of the SPA API. The catch-all at the bottom
| ensures any path not matched above still loads the SPA's index.html,
| letting the React Router handle client-side routing.
| API routes (prefix /api) and sanctum routes are handled by api.php
| and loaded separately — they are NOT caught by the SPA fallback.
|
*/

Route::get('/', function () {
    $path = public_path('index.html');
    if (file_exists($path)) {
        return response()->file($path);
    }

    return ['Laravel' => app()->version()];
});

require __DIR__.'/auth.php';

// Catch-all: serve the SPA for non-API paths.
// Exclude /api/* and /sanctum/* so those hit api.php instead.
Route::get('/{any}', function () {
    $path = public_path('index.html');
    if (file_exists($path)) {
        return response()->file($path);
    }
    return response()->json(['message' => 'SPA not built. Run: cd FRONTEND && pnpm run build'], 404);
})->where('any', '(?!api|sanctum).*');

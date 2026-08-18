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
|
*/

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

require __DIR__.'/auth.php';

// Catch-all: serve the SPA for any path not matched above.
// This lets the React Router handle /home, /friends, /messages, etc.
Route::get('/{any}', function () {
    $path = public_path('index.html');
    if (file_exists($path)) {
        return response()->file($path);
    }
    return response()->json(['message' => 'SPA not built. Run: cd FRONTEND && pnpm run build'], 404);
})->where('any', '.*');

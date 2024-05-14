<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/



// Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::group(["middleware" => "auth:sanctum"], function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
        
    });

    // Route::group(["middleware" => "auth:sanctum"], function () {
        
    //     // Route::get('/user/posts', function (Request $request) {
    //     //     return $request->user()->posts();
    //     // });
    
      
    //     Route::get('/user/posts', [AuthController::class, "me"]);
    // });
    

    Route::get('/user/posts', [AuthController::class, "me"]);
    Route::apiResource('/users', UserController::class);
    Route::apiResource("/posts", PostController::class);

    // Route::apiResource('users.posts', PostController::class)->scoped();
});


// Route::post('login', [AuthController::class, "login"]);
// Route::post('logout', [AuthController::class, "logout"]);
// Route::post('signup', [AuthController::class, "signup"]);

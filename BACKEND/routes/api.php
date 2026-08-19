<?php

use App\Http\Controllers\Api\FollowerController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\TokenAuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Resources\PostResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ── Public: Token Auth ──
Route::post('/token-login', [TokenAuthController::class, 'login'])
    ->middleware('throttle:60,1')
    ->name('token.login');

// ── Protected (Bearer Token) ──
Route::middleware('auth:sanctum')->group(function () {

    // ── Auth ──
    Route::get('/user', [TokenAuthController::class, 'me'])->name('user.me');
    Route::post('/logout', [TokenAuthController::class, 'logout'])->name('logout');
    Route::get('/user/posts', function (Request $request) {
        return PostResource::collection($request->user()->posts->whereNull('parent_id'));
    });
    Route::get('/user/suggestions', function (Request $request) {
        return UserResource::collection($request->user()->suggestions());
    });

    // ── Users ──
    Route::get('/users/search', [UserController::class, 'search']);
    Route::get('/users/{user}/followers', [UserController::class, 'followers']);
    Route::get('/users/{user}/following', [UserController::class, 'following']);
    Route::get('/users/{user}/posts', [UserController::class, 'userPosts']);
    Route::get('/users/{user}/replies', [UserController::class, 'userReplies']);
    Route::get('/users/{user}/likes', [UserController::class, 'userLikes']);
    Route::apiResource('/users', UserController::class);

    // ── Posts ──
    Route::apiResource('/posts', PostController::class);
    Route::post('/post/{post}/update', [PostController::class, 'updatePost']);
    Route::get('/posts/{post}/comments', [PostController::class, 'getPostComments']);
    Route::get('/{username}/post/{post_id}', [PostController::class, 'getPostByUsernameAndId']);

    // ── Follow ──
    Route::post('/users/{user}/changeFollowStatus', [FollowerController::class, 'changeFollowStatus']);

    // ── Likes ──
    Route::post('/posts/{post}/changeLikeStatus', [LikeController::class, 'changeLikeStatus']);

    // ── Notifications ──
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // ── Messages ──
    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
    Route::get('/messages/{user}', [MessageController::class, 'messagesWith']);
    Route::post('/messages/{user}', [MessageController::class, 'send']);
});

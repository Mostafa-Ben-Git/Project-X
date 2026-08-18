<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FollowerController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\UserController;
use App\Http\Resources\PostResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::group(["middleware" => "auth:sanctum"], function () {

  // ── Auth ──
  Route::get('/user', function (Request $request) {
    return UserResource::make($request->user());
  });

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
  Route::apiResource('/users', UserController::class);

  // ── Posts ──
  Route::apiResource("/posts", PostController::class);
  Route::post('/post/{post}/update', [PostController::class, 'updatePost']);
  Route::get("/posts/{post}/comments", [PostController::class, "getPostComments"]);
  Route::get("/{username}/post/{post_id}", [PostController::class, "getPostByUsernameAndId"]);

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

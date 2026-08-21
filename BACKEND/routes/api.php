<?php

use App\Http\Controllers\Api\BookmarkController;
use App\Http\Controllers\Api\FollowerController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PostViewController;
use App\Http\Controllers\Api\RepostController;
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
    Route::post('/heartbeat', function (Request $request) {
        $user = $request->user();
        $user->update(['last_active_at' => now(), 'status' => 'online']);
        \App\Support\Broadcast::safe(new \App\Events\UserStatusBroadcast($user));
        return response()->json(['ok' => true]);
    });
    Route::post('/status', function (Request $request) {
        $request->validate(['status' => 'required|string|in:online,away,offline,dnd,hidden']);
        $user = $request->user();
        $user->update([
            'status' => $request->status,
            'last_active_at' => $request->status === 'offline' ? now() : $user->last_active_at,
        ]);
        \App\Support\Broadcast::safe(new \App\Events\UserStatusBroadcast($user));
        return response()->json(['ok' => true]);
    });
    Route::get('/user/posts', function (Request $request) {
        return PostResource::collection($request->user()->posts->whereNull('parent_id'));
    });
    Route::get('/user/suggestions', function (Request $request) {
        return UserResource::collection($request->user()->suggestions());
    });

    // ── Users ──
    Route::get('/users/search', [UserController::class, 'search']);
    Route::get('/users/{user}/followers', [UserController::class, 'followers'])->whereUuid('user');
    Route::get('/users/{user}/following', [UserController::class, 'following'])->whereUuid('user');
    Route::get('/users/{user}/posts', [UserController::class, 'userPosts'])->whereUuid('user');
    Route::get('/users/{user}/replies', [UserController::class, 'userReplies'])->whereUuid('user');
    Route::get('/users/{user}/likes', [UserController::class, 'userLikes'])->whereUuid('user');
    Route::get('/users/{user}/reposts', [UserController::class, 'userReposts'])->whereUuid('user');
    Route::get('/users/{user}/posts-count', [UserController::class, 'userPostsCount'])->whereUuid('user');
    Route::get('/users/{user}/replies-count', [UserController::class, 'userRepliesCount'])->whereUuid('user');
    Route::get('/users/{user}/reposts-count', [UserController::class, 'userRepostsCount'])->whereUuid('user');
    Route::post('/users/change-password', [UserController::class, 'changePassword']);
    Route::get('/profiles/{username}', [UserController::class, 'showByUsername']);
    Route::apiResource('/users', UserController::class)->whereUuid('user');

    // ── Posts ──
    Route::apiResource('/posts', PostController::class)->whereUuid('post');
    Route::post('/post/{post}/update', [PostController::class, 'updatePost'])->whereUuid('post');
    Route::get('/posts/{post}/comments', [PostController::class, 'getPostComments'])->whereUuid('post');
    Route::get('/{username}/post/{post_id}', [PostController::class, 'getPostByUsernameAndId'])->whereUuid('post_id');

    // ── Follow ──
    Route::post('/users/{user}/changeFollowStatus', [FollowerController::class, 'changeFollowStatus'])->whereUuid('user');

    // ── Likes ──
    Route::post('/posts/{post}/changeLikeStatus', [LikeController::class, 'changeLikeStatus'])->whereUuid('post');

    // ── Reposts ──
    Route::post('/posts/{post}/repost', [RepostController::class, 'toggleRepost'])->whereUuid('post');
    Route::post('/posts/{post}/pin', [PostController::class, 'togglePin'])->whereUuid('post');

    // ── Views (scaled: deduped + buffered) ──
    Route::post('/posts/{post}/view', [PostViewController::class, 'store'])->whereUuid('post')->middleware('throttle:60,1');

    // ── Bookmarks ──
    Route::post('/posts/{post}/bookmark', [BookmarkController::class, 'toggle'])->whereUuid('post');
    Route::get('/bookmarks', [BookmarkController::class, 'index']);
    Route::delete('/bookmarks/{post}', [BookmarkController::class, 'destroy'])->whereUuid('post');

    // ── Notifications ──
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->whereUuid('notification');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // ── Messages (secure room format: encrypted partner id) ──
    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
    // Secure room routes (preferred) — token is Crypt::encryptString(partnerId)
    Route::get('/messages/room/{room}', [MessageController::class, 'messagesByRoom']);
    Route::post('/messages/room/{room}', [MessageController::class, 'sendToRoom'])->middleware('throttle:messages');
    Route::get('/messages/room/{room}/resolve', [MessageController::class, 'resolveRoomToken']);
    Route::get('/messages/room/{room}/pinned', [MessageController::class, 'pinned']);
    Route::post('/messages/room/{room}/reply/{message}', [MessageController::class, 'reply'])->whereUuid('message')->middleware('throttle:messages');
    Route::delete('/messages/room/{room}/{message}', [MessageController::class, 'destroy'])->whereUuid('message');
    Route::post('/messages/room/{room}/{message}/restore', [MessageController::class, 'restore'])->whereUuid('message');
    Route::post('/messages/room/{room}/{message}/pin', [MessageController::class, 'togglePin'])->whereUuid('message');
    Route::get('/users/{user}/room', [MessageController::class, 'roomForUser'])->whereUuid('user');
    // Legacy direct-user routes (kept for backward compat, also secured via auth)
    Route::get('/messages/{user}', [MessageController::class, 'messagesWith'])->whereUuid('user');
    Route::post('/messages/{user}', [MessageController::class, 'send'])->whereUuid('user')->middleware('throttle:messages');
});

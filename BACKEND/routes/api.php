<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\FollowerController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\UserController;
use App\Http\Resources\PostResource;
use App\Http\Resources\UserResource;
use App\Models\Post;
use App\Models\User;
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
    return UserResource::make($request->user());
  });

  Route::get('/user/posts', function (Request $request) {
    return PostResource::collection($request->user()->posts->whereNull('parent_id'));
  });

  Route::get('/user/suggestions', function (Request $request) {
    return UserResource::collection($request->user()->suggestions());
  });

  Route::post('/users/{user}/changeFollowStatus', [FollowerController::class, 'changeFollowStatus']);

  Route::post(
    '/posts/{post}/changeLikeStatus',
    [LikeController::class, 'changeLikeStatus']
  );

  Route::get(
    "/posts/{post}/comments",
    [PostController::class, "getPostComments"]
  );
  Route::post('/post/{post}/update', [PostController::class, 'updatePost']);


  Route::get(
    "/{username}/post/{post_id}",
    [PostController::class, "getPostByUsernameAndId"]
  );

  Route::get(
    '/tests',
    function (Request $request) {
      return UserResource::collection(user::find(1)->suggestions());
      // return PostResource::make(Post::whereNull('parent_id')->inRandomOrder()->first());
      // return PostResource::make(Post::find(1)->first());
      // return PostResource::collection(Post::whereNull('parent_id')->latest()->paginate(6));
    }
  );

  Route::get('/users/search', [UserController::class, 'search']);
  Route::apiResource('/users', UserController::class);
  Route::apiResource("/posts", PostController::class);


  // Route::apiResource('users.posts', PostController::class)->scoped();
});


// Route::post('login', [AuthController::class, "login"]);
// Route::post('logout', [AuthController::class, "logout"]);
// Route::post('signup', [AuthController::class, "signup"]);

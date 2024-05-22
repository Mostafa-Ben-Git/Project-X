<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Http\Resources\PostCollection;
use App\Http\Resources\PostResource;
use App\Models\Comment;
use App\Models\Image;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index()
  {
    return PostResource::collection(Post::whereNull('parent_id')->latest()->paginate(6));
  }

  /**
   * Store a newly created resource in storage.
   */
  public function store(Request $request)
  {
    $user = $request->user();

    $post = new Post();

    $trimmedText = nl2br(Str::of($request->text)->trim());
    $post->text = $trimmedText;
    
    if ($request->has("parent_id")) {
      $post->parent_id = $request->parent_id;
    }

    $user->posts()->save($post);

    if ($request->has("images")) {
      foreach ($request->images as $image) {
        $post_image = new Image();

        $imageName = $user->username . '_' . time() . '_' . str_replace(' ', '_', $image->getClientOriginalName());

        $image->move(public_path('images/posts'), $imageName);
        $post_image->image_path = asset('images/posts/' . $imageName);

        $post->images()->save($post_image);
      }
    }


    return new PostResource($post);
  }

  /**
   * Display the specified resource.
   */
  public function show(Request $request, User $user, Post $post)
  {
    return new PostResource($post);
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, Post $post)
  {
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(Post $post)
  {
    //
  }
  public function getPostComments(Post $post)
  {
    if ($post->comments->count() > 0) {
      return PostResource::collection($post->comments()->paginate(5));
    } else {
      return response()->json(["message" => "No comments found"], 404);
    }
  }
}

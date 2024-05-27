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

use function PHPUnit\Framework\isInstanceOf;
use function Symfony\Component\VarDumper\Dumper\esc;

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

    $trimmedText = nl2br(Str::of($request->content)->trim());
    $post->content = $trimmedText;

    if ($request->has("parent_id")) {
      $post->parent_id = $request->parent_id;
    } else {
      $post->parent_id = null;
    }

    $user->posts()->save($post);

    if ($request->has("images")) {
      foreach ($request->images as $image) {
        $post_image = new Image();

        $imageName = time() . '.' . $image->getClientOriginalExtension();

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
  public function show(Post $post)
  {
    return new PostResource($post);
  }
  /**
   * Remove the specified resource from storage.
   */
  public function destroy(Post $post)
  {
    $post->delete();

    return response()->json(["message" => "Post deleted successfully"], 200);
    //
  }

  public function getPostComments(Post $post)
  {
    if ($post->comments->count() > 0) {
      return PostResource::collection($post->comments()->latest()->paginate(5));
    } else {
      return response()->json(["message" => "No comments found"], 404);
    }
  }

  public function getPostByUsernameAndId($username, $post_id)
  {
    $post = User::where('username', $username)->first()->posts()->where('id', $post_id)->first();
    if ($post == null) {
      return response()->json(['message' => 'Post not found.'], 404);
    } else {
      return new PostResource($post);
    }
  }

  /**
   * Update the specified resource in storage.
   */

  public function updatePost(Request $request, Post $post)
  {

    $trimmedText = nl2br(Str::of($request->input('content'))->trim());

    $post->content = $trimmedText;

    if ($request->hasAny('content')) {
      # code...
    }

    if ($request->has("parent_id")) {
      $post->parent_id = $request->parent_id;
    } else {
      $post->parent_id = null;
    }
    // Process images
    if ($request->has('images')) {
      $array_image_path = $post->images->pluck('image_path')->toArray();
      foreach ($request->images as $image) {
        if (is_string($image)) {
          foreach ($array_image_path as $path) {
            if ($path != $image) {
              // Find the image in the database and delete
              $postImage = $post->images()->where('image_path', $path)->first();
              if ($postImage) {
                $postImage->delete();
              }
            }
          }
        } else {
          // Process the new uploaded image
          $post_image = new Image();
          $imageName = time() . '.' . $image->getClientOriginalExtension();
          $image->move(public_path('images/posts'), $imageName);
          $post_image->image_path = asset('images/posts/' . $imageName);

          $post->images()->save($post_image);
        }
      }
    } else {
      $post->images()->delete();
    }
    $post->save();


    $updated = Post::where('id', $post->id)->first();

    return new PostResource($updated);
  }
}

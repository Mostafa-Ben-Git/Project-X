<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Image;
use App\Models\Notification;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
  /**
   * Display a listing of posts (top-level only).
   */
  public function index(Request $request)
  {
    $viewer = $request->user();
    $followingIds = $viewer->followings()->pluck('users.id');

    // Hide posts from private authors unless the viewer follows them or owns the post.
    $posts = Post::whereNull('parent_id')
      ->where(function ($query) use ($viewer, $followingIds) {
        $query
          ->whereHas('user', fn($q) => $q->where('is_private', false))
          ->orWhere('user_id', $viewer->id)
          ->orWhereIn('user_id', $followingIds);
      })
      ->latest();

    return PostResource::collection(
      PostResource::prepare($posts)->paginate(6)
    );
  }

  /**
   * Store a newly created post.
   */
  public function store(StorePostRequest $request)
  {
    $validated = $request->validated();
    $user = $request->user();

    $post = new Post();
    $post->content = nl2br(Str::of($validated['content'])->trim());
    $post->parent_id = $validated['parent_id'] ?? null;

    $user->posts()->save($post);

    // Notify the parent post's author when this is a comment/reply.
    if (!empty($validated['parent_id'])) {
      $parent = Post::find($validated['parent_id']);
      if ($parent && $parent->user_id !== $user->id) {
        Notification::create([
          'user_id' => $parent->user_id,
          'from_user_id' => $user->id,
          'type' => 'comment',
          'content' => $user->first_name . ' ' . $user->last_name . ' commented on your post',
          'post_id' => $parent->id,
        ]);
      }
    }

    // Handle image uploads
    if ($request->hasFile('images')) {
      foreach ($request->file('images') as $image) {
        $imageName = time() . '_' . Str::random(8) . '.' . $image->getClientOriginalExtension();
        $image->move(public_path('images/posts'), $imageName);

        $post->images()->create([
          'image_path' => asset('images/posts/' . $imageName),
        ]);
      }
    }

    return new PostResource($post->load(['user', 'images']));
  }

  /**
   * Display the specified post.
   */
  public function show(Post $post)
  {
    return new PostResource(PostResource::prepare($post->newQuery()->whereKey($post->id))->first());
  }

  /**
   * Update the specified post (owner only).
   */
  public function updatePost(UpdatePostRequest $request, Post $post)
  {
    // Authorization: only the post owner can update
    if ($request->user()->id !== $post->user_id) {
      return response()->json(['message' => 'Unauthorized. You can only edit your own posts.'], 403);
    }

    $validated = $request->validated();

    if (isset($validated['content'])) {
    $post->content = $validated['content'] ? nl2br(Str::of($validated['content'])->trim()) : "";
    }

    $post->parent_id = $validated['parent_id'] ?? $post->parent_id;
    $post->save();

    // Handle images
    if ($request->hasFile('images')) {
      // Collect existing image paths from the request
      $keptPaths = collect($validated['images'] ?? [])
        ->filter(fn($item) => is_string($item))
        ->values();

      // Delete images not in the kept list
      foreach ($post->images as $existingImage) {
        if (!$keptPaths->contains($existingImage->image_path)) {
          // Delete the physical file
          $oldPath = public_path('images/posts/' . basename($existingImage->image_path));
          if (file_exists($oldPath)) {
            unlink($oldPath);
          }
          $existingImage->delete();
        }
      }

      // Upload new images
      foreach ($request->file('images') as $image) {
        if ($image instanceof \Illuminate\Http\UploadedFile) {
          $imageName = time() . '_' . Str::random(8) . '.' . $image->getClientOriginalExtension();
          $image->move(public_path('images/posts'), $imageName);

          $post->images()->create([
            'image_path' => asset('images/posts/' . $imageName),
          ]);
        }
      }
    } else {
      // No images key sent: delete all existing images
      foreach ($post->images as $existingImage) {
        $oldPath = public_path('images/posts/' . basename($existingImage->image_path));
        if (file_exists($oldPath)) {
          unlink($oldPath);
        }
        $existingImage->delete();
      }
    }

    return new PostResource($post->fresh(['images', 'user']));
  }

  /**
   * Remove the specified post (owner only).
   */
  public function destroy(Request $request, Post $post): JsonResponse
  {
    // Authorization: only the post owner can delete
    if ($request->user()->id !== $post->user_id) {
      return response()->json(['message' => 'Unauthorized. You can only delete your own posts.'], 403);
    }

    // Delete associated images
    foreach ($post->images as $image) {
      $oldPath = public_path('images/posts/' . basename($image->image_path));
      if (file_exists($oldPath)) {
        unlink($oldPath);
      }
    }

    $post->delete();

    return response()->json(['message' => 'Post deleted successfully'], 200);
  }

  /**
   * Get comments for a post.
   */
  public function getPostComments(Post $post)
  {
    if ($post->comments()->count() === 0) {
      return response()->json(['message' => 'No comments found'], 404);
    }

    return PostResource::collection(
      PostResource::prepare(
        $post->comments()->latest()
      )->paginate(5)
    );
  }

  /**
   * Get a post by username and post ID.
   */
  public function getPostByUsernameAndId($username, $post_id)
  {
    $user = User::where('username', $username)->first();

    if (!$user) {
      return response()->json(['message' => 'User not found.'], 404);
    }

    $post = $user->posts()->where('id', $post_id)->first();

    if (!$post) {
      return response()->json(['message' => 'Post not found.'], 404);
    }

    return new PostResource(PostResource::prepare($post->newQuery()->whereKey($post->id))->first());
  }
}

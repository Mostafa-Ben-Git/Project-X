<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
  public function index(Request $request)
  {
    $user = $request->user();
    $query = $user->bookmarkedPosts()
      ->latest('bookmarks.created_at')
      ->with(['user', 'images']);

    // Apply PostResource preparation for counts
    $paginated = PostResource::prepare($query)->paginate(6);

    return PostResource::collection($paginated);
  }

  public function toggle(Request $request, Post $post)
  {
    $userId = $request->user()->id;
    $existing = $post->bookmarks()->where('user_id', $userId)->first();

    if ($existing) {
      $existing->delete();
      return response()->json(['bookmarked' => false, 'message' => 'removed'], 200);
    }

    $post->bookmarks()->create(['user_id' => $userId]);

    return response()->json(['bookmarked' => true, 'message' => 'saved'], 201);
  }

  public function destroy(Request $request, Post $post)
  {
    $deleted = $post->bookmarks()->where('user_id', $request->user()->id)->delete();
    if ($deleted) {
      return response()->json(['message' => 'Bookmark removed'], 200);
    }
    return response()->json(['message' => 'Not bookmarked'], 404);
  }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Post;
use App\Models\Repost;
use Illuminate\Http\Request;

class RepostController extends Controller
{
  function __construct()
  {
    $this->middleware('auth:sanctum');
  }

  public function toggleRepost(Request $request, Post $post)
  {
    $userId = $request->user()->id;

    $repost = $post->reposts()->where('user_id', $userId)->first();

    if ($repost) {
      $repost->delete();
      $reposted = false;
    } else {
      Repost::create([
        'user_id' => $userId,
        'post_id' => $post->id,
      ]);

      // Create notification (don't notify yourself)
      if ($post->user_id !== $userId) {
        Notification::create([
          'user_id' => $post->user_id,
          'from_user_id' => $userId,
          'type' => 'repost',
          'content' => $request->user()->first_name . ' ' . $request->user()->last_name . ' reposted your post',
          'post_id' => $post->id,
        ]);
      }

      $reposted = true;
    }

    return response()->json([
      'reposted' => $reposted,
      'reposts_count' => $post->reposts()->count(),
    ], 200);
  }
}

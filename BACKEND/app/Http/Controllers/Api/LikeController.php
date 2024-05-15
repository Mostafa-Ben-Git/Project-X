<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;

class LikeController extends Controller
{
  function __construct()
  {
    $this->middleware('auth:sanctum');
  }
  public function changeLikeStatus(Request $request, Post $post)
  {

    $like = $post->likes()->where('user_id', $request->user()->id)->first();
    if ($like) {
      $like->delete();
      return response()->json(['post' => 'unliked'], 200);
    } else {
      $post->likes()->create([
        'user_id' => $request->user()->id
      ]);
      return response()->json(['post' => 'liked'], 200);
    }
  }
}

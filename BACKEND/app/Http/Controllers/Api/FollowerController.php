<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Follower;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class FollowerController extends Controller
{
  public function changeFollowStatus(Request $request, User $user)
  {
    $follow = Follower::where('follower_id', $request->user()->id)->where('following_id', $user->id)->first();
    if ($follow) {
      $follow->delete();
      return response()->json(['user' => 'unfollowed'], 200);
    }

    $follow = Follower::create([
      'following_id' => $user->id,
      'follower_id' => $request->user()->id
    ]);

    // Create notification
    Notification::create([
      'user_id' => $user->id,
      'from_user_id' => $request->user()->id,
      'type' => 'follow',
      'content' => $request->user()->first_name . ' ' . $request->user()->last_name . ' started following you',
    ]);

    return response()->json(['user' => 'followed'], 200);
  }
}

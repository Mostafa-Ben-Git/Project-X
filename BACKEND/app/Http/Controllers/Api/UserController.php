<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
  public function index()
  {
    return UserResource::collection(User::all());
  }

  public function store(Request $request)
  {
    $user = User::create($request->all());
    return response()->json($user, 201);
  }

  public function show(User $user)
  {
    return new UserResource($user);
  }

  public function update(Request $request, User $user)
  {
    $user->update($request->except(['avatar', 'cover_image']));

    if ($request->hasFile('avatar')) {
      if ($user->avatar) {
        $oldAvatarPath = public_path('images/profiles/' . basename($user->avatar));
        if (file_exists($oldAvatarPath)) {
          unlink($oldAvatarPath);
        }
      }

      $image = $request->file('avatar');
      $imageName = $user->username . '_' . time() . '_' . str_replace(' ', '_', $image->getClientOriginalName());
      $image->move(public_path('images/profiles'), $imageName);
      $user->avatar = asset('images/profiles/' . $imageName);
      $user->save();
    }

    if ($request->hasFile('cover_image')) {
      if ($user->cover_image) {
        $oldCoverImagePath = public_path('images/profiles/' . basename($user->cover_image));
        if (file_exists($oldCoverImagePath)) {
          unlink($oldCoverImagePath);
        }
      }

      $image = $request->file('cover_image');
      $imageName = $user->username . '_' . time() . '_' . str_replace(' ', '_', $image->getClientOriginalName());
      $image->move(public_path('images/profiles'), $imageName);
      $user->cover_image = asset('images/profiles/' . $imageName);
      $user->save();
    }

    return new UserResource($user->fresh());
  }

  public function destroy(User $user)
  {
    $user->delete();
    return response()->json(null, 204);
  }

  public function search(Request $request)
  {
    $query = $request->input('q');

    $users = User::where('username', 'like', '%' . $query . '%')
      ->orwhere('first_name', 'like', '%' . $query . '%')
      ->orWhere('last_name', 'like', '%' . $query . '%')
      ->limit(5)->get();

    return UserResource::collection($users);
  }

  /**
   * Get followers of a user.
   */
  public function followers(User $user)
  {
    $followers = $user->followers()->withCount('followers')->get();
    return UserResource::collection($followers);
  }

  /**
   * Get users that a user is following.
   */
  public function following(User $user)
  {
    $following = $user->followings()->withCount('followers')->get();
    return UserResource::collection($following);
  }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserController extends Controller
{
  public function index()
  {
    return UserResource::collection(User::all());
  }

  public function show(User $user)
  {
    return new UserResource($user);
  }

  /**
   * Update user profile (owner only).
   * Handles avatar and cover_image uploads safely.
   */
  public function update(UpdateProfileRequest $request, User $user): JsonResponse
  {
    // Authorization: only the user themselves can update their profile
    if ($request->user()->id !== $user->id) {
      return response()->json(['message' => 'Unauthorized. You can only edit your own profile.'], 403);
    }

    $validated = $request->validated();

    // Update text fields only (exclude file fields)
    $textFields = collect($validated)->except(['avatar', 'cover_image'])->toArray();
    if (!empty($textFields)) {
      $user->update($textFields);
    }

    // Handle avatar upload
    if ($request->hasFile('avatar')) {
      // Delete old avatar file if it exists
      if ($user->avatar) {
        $oldAvatarPath = public_path('images/profiles/' . basename($user->avatar));
        if (file_exists($oldAvatarPath)) {
          @unlink($oldAvatarPath);
        }
      }

      $image = $request->file('avatar');
      $imageName = $user->username . '_' . time() . '_' . Str::random(4) . '.' . $image->getClientOriginalExtension();
      $image->move(public_path('images/profiles'), $imageName);
      $user->avatar = asset('images/profiles/' . $imageName);
      $user->save();
    }

    // Handle cover image upload
    if ($request->hasFile('cover_image')) {
      // Delete old cover image file if it exists
      if ($user->cover_image) {
        $oldCoverPath = public_path('images/profiles/' . basename($user->cover_image));
        if (file_exists($oldCoverPath)) {
          @unlink($oldCoverPath);
        }
      }

      $image = $request->file('cover_image');
      $imageName = $user->username . '_cover_' . time() . '_' . Str::random(4) . '.' . $image->getClientOriginalExtension();
      $image->move(public_path('images/profiles'), $imageName);
      $user->cover_image = asset('images/profiles/' . $imageName);
      $user->save();
    }

    return new UserResource($user->fresh());
  }

  /**
   * Delete user (owner only).
   */
  public function destroy(Request $request, User $user): JsonResponse
  {
    if ($request->user()->id !== $user->id && !$request->user()->hasRole('admin')) {
      return response()->json(['message' => 'Unauthorized.'], 403);
    }

    $user->delete();
    return response()->json(null, 204);
  }

  public function search(Request $request)
  {
    $query = $request->input('q', '');

    if (empty(trim($query))) {
      return UserResource::collection(collect());
    }

    $users = User::where('username', 'like', '%' . $query . '%')
      ->orWhere('first_name', 'like', '%' . $query . '%')
      ->orWhere('last_name', 'like', '%' . $query . '%')
      ->limit(5)
      ->get();

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

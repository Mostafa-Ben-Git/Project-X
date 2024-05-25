<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index()
  {
    return UserResource::collection(User::all());
  }

  /**
   * Store a newly created resource in storage.
   */
  public function store(Request $request)
  {
    $user = User::create($request->all());
    return response()->json($user, 201);
  }

  /**
   * Display the specified resource.
   */
  public function show(User $user)
  {
    return new UserResource($user);
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, User $user)
  {
    $user->update($request->all());


    if ($request->hasFile('avatar')) {
      dd('here');
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
    return new UserResource($user);
    dd($user);
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(User $user)
  {
  }
  public function search(Request $request)
  {
    $query = $request->input('q');

    // dd($query);

    $users = User::where('username', 'like', '%' . $query . '%')
      ->orwhere('first_name', 'like', '%' . $query . '%')
      ->orWhere('last_name', 'like', '%' . $query . '%')
      ->limit(5)->get();

    return UserResource::collection($users);
  }
}

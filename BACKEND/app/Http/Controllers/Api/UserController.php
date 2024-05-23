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
            $image = $request->file('avatar');
            $imageName = $user->username . '' . time() . '' . str_replace(' ', '_', $image->getClientOriginalName());
            $image->move(public_path('images/profiles'), $imageName);
            $user->profile_image = asset('images/profiles/' . $imageName);
            $user->save();
        }
        
        if ($request->hasFile('cover_image')) {
            $image = $request->file('cover_image');
            $imageName = $user->username . '' . time() . '' . str_replace(' ', '_', $image->getClientOriginalName());
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
}
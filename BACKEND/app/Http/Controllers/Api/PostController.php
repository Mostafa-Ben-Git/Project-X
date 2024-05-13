<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostCollection;
use App\Http\Resources\PostResource;
use App\Models\Image;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return PostResource::collection(Post::latest()->paginate(6));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $post = new Post();

        $post->text = nl2br($request->text);
        $user->posts()->save($post);

        if ($request->has("images")) {
            foreach ($request->images as $image) {
                $post_image = new Image();

                $imageName = $user->username . '_' . time() . '_' . str_replace(' ', '_', $image->getClientOriginalName());

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
    public function show(User $user, Post $post)
    {
        return new PostResource($post);
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        //
    }
}

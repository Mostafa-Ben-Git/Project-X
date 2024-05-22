<?php

namespace Database\Factories;

use App\Models\Comment;
use App\Models\Like;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Like>
 */
class LikeFactory extends Factory
{
  protected $model = Like::class;

  public function definition()
  {
    // $postId = Post::inRandomOrder()->first()->id;
    // $userId = User::inRandomOrder()->first()->id;

    // // Check if the user has already liked the post
    // $alreadyLiked = Like::where('user_id', $userId)->where('post_id', $postId)->exists();

    // if ($alreadyLiked) {
    //   // User has already liked this post, generate a new like for a different post
    //   $postId = Post::where('id', '!=', $postId)->inRandomOrder()->first()->id;
    // }

    return [
      'post_id' => Post::factory(),
      'user_id' => User::factory(),
    ];
  }
}

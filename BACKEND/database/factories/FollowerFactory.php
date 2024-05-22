<?php

namespace Database\Factories;

use App\Models\Follower;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class FollowerFactory extends Factory
{
  protected $model = Follower::class;
  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition()
  {
    // Get a random user to follow
    $followerId = User::inRandomOrder()->first()->id;

    // Find another random user to be followed, ensuring it's not the same user
    do {
      $followingId = User::inRandomOrder()->first()->id;
    } while ($followerId == $followingId || Follower::where('follower_id', $followerId)->where('following_id', $followingId)->exists());

    return [
      'follower_id' => $followerId,
      'following_id' => $followingId,
    ];
  }
}

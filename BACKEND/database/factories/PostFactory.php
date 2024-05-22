<?php

namespace Database\Factories;

use App\Models\Image;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Post>
 */
class PostFactory extends Factory
{
  protected $model = Post::class;
  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */

  public function definition(): array
  {
    return [
      'parent_id' => null, // Default to null for posts
      'user_id' => User::all()->random()->id,
      'content' => $this->faker->paragraph,
    ];
  }

  public function postWithImages()
  {
    return $this->afterCreating(function (Post $post) {
      $imagesCount = rand(0, 3); // Random number of images
      Image::factory()->count($imagesCount)->create(['post_id' => $post->id]);
    });
  }

  public function comment(Post $parentPost)
  {
    return $this->state(function (array $attributes) use ($parentPost) {
      return [
        'parent_id' => $parentPost->id,
        'content' => $this->faker->sentence,
      ];
    })->afterCreating(function (Post $post) {
      if (rand(0, 1)) {
        Image::factory()->create(['post_id' => $post->id]);
      }
    });;
  }
}

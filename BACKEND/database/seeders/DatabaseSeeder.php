<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Follower;
use App\Models\Image;
use App\Models\Like;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
  /**
   * Seed the application's database.
   */
  public function run(): void
  {
    User::factory()->create([
      'email' => 'test@example.com',
      'first_name' => 'test',
      'last_name' => 'test',
    ]);
    User::factory()->create([
      'email' => 'postman@example.com',
      "first_name" => "postman",
      "last_name" => "postman",
    ]);

    User::factory(30)->create()->each(function ($user) {
      $followers = User::where('id', '!=', $user->id)
        ->inRandomOrder()
        ->take(rand(1, 10))
        ->pluck('id');

      // Attach followers, ensuring no duplicates and adding timestamps manually
      $syncData = [];
      foreach ($followers as $followerId) {
        $syncData[$followerId] = ['created_at' => now(), 'updated_at' => now()];
      }

      $user->followers()->sync($syncData);
    });

    // Follower::factory()->count(100)->create();

    Post::factory()
      ->count(50)
      ->postWithImages()
      ->create()
      ->each(function ($post) {
        $commentCount = rand(3, 10);
        Post::factory()
          ->count($commentCount)
          ->comment($post)
          ->create()
          ->each(function ($comment) use ($post) {
            // Randomly like comments
            $users = User::inRandomOrder()->take(rand(1, 5))->get();
            foreach ($users as $user) {
              if (!Like::where('user_id', $user->id)->where('post_id', $comment->id)->exists()) {
                Like::factory()->create(
                  [
                    'user_id' => $user->id,
                    'post_id' => $comment->id
                  ]
                );
              }
            }
          });
        $users = User::inRandomOrder()->take(rand(1, 10))->get();
        foreach ($users as $user) {
          if (!Like::where('user_id', $user->id)->where('post_id', $post->id)->exists()) {
            Like::factory()->create([
              'user_id' => $user->id,
              'post_id' => $post->id
            ]);
          }
        }
      });

    // Like::factory(200)->create();

    // $this->call(FriendSeeder::class);
    // \App\Models\Comment::factory(500)->create();
  }
}

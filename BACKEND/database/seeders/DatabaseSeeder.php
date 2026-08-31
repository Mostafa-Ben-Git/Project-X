<?php

namespace Database\Seeders;

use App\Models\Follower;
use App\Models\Image;
use App\Models\Like;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
  public function run(): void
  {
    // ── Create 2 known users for testing ──
    $testUser = User::factory()->create([
      'email' => 'test@example.com',
      'first_name' => 'Test',
      'last_name' => 'User',
      'username' => 'testuser',
      'avatar' => 'https://ui-avatars.com/api/?name=Test+User&background=264653&color=fff&bold=true&size=128',
      'cover_image' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=300&fit=crop&auto=format&q=80',
      'bio' => 'This is the test user account for Project-X.',
    ]);

    $otherUser = User::factory()->create([
      'email' => 'other@example.com',
      'first_name' => 'Other',
      'last_name' => 'Person',
      'username' => 'otherperson',
      'avatar' => 'https://ui-avatars.com/api/?name=Other+Person&background=e76f51&color=fff&bold=true&size=128',
      'cover_image' => 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=300&fit=crop&auto=format&q=80',
      'bio' => 'Another user for testing social features.',
    ]);

    // ── Create 20 more random users ──
    User::factory(20)->create();

    // ── Followers ──
    User::all()->each(function ($user) {
      $followers = User::where('id', '!=', $user->id)
        ->inRandomOrder()
        ->take(rand(1, 8))
        ->pluck('id');

      foreach ($followers as $followerId) {
        if (!$user->followers()->where('follower_id', $followerId)->exists()) {
          $user->followers()->attach($followerId, ['created_at' => now(), 'updated_at' => now()]);
        }
      }
    });

    // ── Posts with images and comments ──
    Post::factory()
      ->count(30)
      ->postWithImages()
      ->create()
      ->each(function ($post) {
        // Create comments
        $commentCount = rand(2, 6);
        Post::factory()
          ->count($commentCount)
          ->comment($post)
          ->create()
          ->each(function ($comment) {
            $users = User::inRandomOrder()->take(rand(1, 3))->get();
            foreach ($users as $user) {
              if (!Like::where('user_id', $user->id)->where('post_id', $comment->id)->exists()) {
                Like::factory()->create([
                  'user_id' => $user->id,
                  'post_id' => $comment->id,
                ]);
              }
            }
          });

        // Like the post
        $users = User::inRandomOrder()->take(rand(1, 8))->get();
        foreach ($users as $user) {
          if (!Like::where('user_id', $user->id)->where('post_id', $post->id)->exists()) {
            Like::factory()->create([
              'user_id' => $user->id,
              'post_id' => $post->id,
            ]);
          }
        }

        // Repost the post
        $repostUsers = User::inRandomOrder()->take(rand(0, 4))->get();
        foreach ($repostUsers as $user) {
          if (!\App\Models\Repost::where('user_id', $user->id)->where('post_id', $post->id)->exists()) {
            \App\Models\Repost::create([
              'user_id' => $user->id,
              'post_id' => $post->id,
            ]);
          }
        }
      });

    // ── Messages between users ──
    User::all()->each(function ($user) {
      $partners = User::where('id', '!=', $user->id)
        ->inRandomOrder()
        ->take(rand(1, 5))
        ->get();

      foreach ($partners as $partner) {
        $messageCount = rand(1, 5);
        for ($i = 0; $i < $messageCount; $i++) {
          $sender = $i % 2 === 0 ? $user : $partner;
          $receiver = $i % 2 === 0 ? $partner : $user;
          Message::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'content' => fake()->sentence(rand(3, 10)),
            'read_at' => fake()->optional(0.5)->dateTimeThisMonth,
          ]);
        }
      }
    });

    // ── Notifications ──
    Notification::factory()->count(40)->create();

    // ── Create specific test data for known users ──
    // testuser follows otherperson
    if (!Follower::where('follower_id', $testUser->id)->where('following_id', $otherUser->id)->exists()) {
      Follower::create([
        'follower_id' => $testUser->id,
        'following_id' => $otherUser->id,
      ]);
    }

    // Messages between testuser and otherperson
    Message::create([
      'sender_id' => $testUser->id,
      'receiver_id' => $otherUser->id,
      'content' => 'Hey, how are you?',
      'read_at' => now(),
    ]);
    Message::create([
      'sender_id' => $otherUser->id,
      'receiver_id' => $testUser->id,
      'content' => 'I am doing great, thanks!',
      'read_at' => now(),
    ]);

    // Notification for testuser
    Notification::create([
      'user_id' => $testUser->id,
      'from_user_id' => $otherUser->id,
      'type' => 'follow',
      'content' => 'Other Person started following you',
      'read_at' => null,
    ]);
    Notification::create([
      'user_id' => $testUser->id,
      'from_user_id' => $otherUser->id,
      'type' => 'like',
      'content' => 'Other Person liked your post',
      'post_id' => Post::first()->id,
      'read_at' => null,
    ]);
  }
}

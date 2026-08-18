<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{
  protected $model = Notification::class;

  public function definition(): array
  {
    $fromUser = User::inRandomOrder()->first();
    do {
      $user = User::inRandomOrder()->first();
    } while ($user->id === $fromUser->id);

    $type = $this->faker->randomElement(['follow', 'like', 'comment', 'message']);
    $content = match ($type) {
      'follow' => $fromUser->first_name . ' ' . $fromUser->last_name . ' started following you',
      'like' => $fromUser->first_name . ' ' . $fromUser->last_name . ' liked your post',
      'comment' => $fromUser->first_name . ' ' . $fromUser->last_name . ' commented on your post',
      'message' => $fromUser->first_name . ' ' . $fromUser->last_name . ' sent you a message',
    };

    return [
      'user_id' => $user->id,
      'from_user_id' => $fromUser->id,
      'type' => $type,
      'content' => $content,
      'post_id' => $type === 'like' || $type === 'comment' ? Post::inRandomOrder()->first()->id : null,
      'read_at' => $this->faker->optional(0.4)->dateTimeThisMonth,
    ];
  }
}

<?php

namespace Database\Factories;

use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MessageFactory extends Factory
{
  protected $model = Message::class;

  public function definition(): array
  {
    $sender = User::inRandomOrder()->first();
    do {
      $receiver = User::inRandomOrder()->first();
    } while ($receiver->id === $sender->id);

    return [
      'sender_id' => $sender->id,
      'receiver_id' => $receiver->id,
      'content' => $this->faker->sentence(5),
      'read_at' => $this->faker->optional(0.6)->dateTimeThisMonth,
    ];
  }
}

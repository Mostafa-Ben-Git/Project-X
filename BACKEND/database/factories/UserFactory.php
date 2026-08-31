<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
  protected static ?string $password;

  public function definition(): array
  {
    $firstName = fake()->firstName;
    $lastName = fake()->lastName;
    $username = Str::lower($firstName[0] . $lastName) . rand(100, 999);

    // UI Avatars: free PNG avatars, no key needed
    $bgColors = ['264653','2a9d8f','e9c46a','f4a261','e76f51','606c38','283618','bc6c25','dda15e','6d6875','b5838d','e5989b'];
    $bg = fake()->randomElement($bgColors);
    $avatar = "https://ui-avatars.com/api/?name=" . urlencode($firstName . '+' . $lastName) . "&background={$bg}&color=fff&bold=true&size=128";

    // Weighted status: ~30% online, 40% offline, 10% away, 10% dnd, 10% hidden
    $statusPool = ['online','online','online','offline','offline','offline','offline','away','dnd','hidden'];
    $status = fake()->randomElement($statusPool);
    $lastActiveAt = match ($status) {
      'online' => now()->subMinutes(rand(0, 4)),
      'away' => now()->subMinutes(rand(5, 30)),
      'dnd' => now()->subMinutes(rand(0, 15)),
      'offline' => fake()->optional(0.2, now()->subDays(rand(1, 7)))->passthrough(now()->subHours(rand(2, 48))),
      'hidden' => fake()->optional(0.3, now()->subDays(rand(1, 5)))->passthrough(now()->subHours(rand(5, 72))),
      default => now()->subMinutes(rand(0, 10)),
    };

    return [
      'first_name' => $firstName,
      'last_name' => $lastName,
      'username' => $username,
      'email' => fake()->unique()->safeEmail(),
      'email_verified_at' => now(),
      'password' => static::$password ??= Hash::make('12345678'),
      'avatar' => $avatar,
      'date_de_naissance' => $this->faker->date,
      'cover_image' => $this->coverImageUrl(),
      'bio' => $this->faker->paragraph,
      'derniere_connexion' => $this->faker->dateTimeThisYear,
      'statut' => $this->faker->randomElement(['en ligne', 'hors ligne']),
      'genre' => $this->faker->randomElement(['masculin', 'féminin', 'autre']),
      'adresse' => $this->faker->address,
      'ville_origine' => $this->faker->city,
      'ville_habituelle' => $this->faker->city,
      'Situation amoureuse' => $this->faker->randomElement(['Célibataire', 'En couple', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve']),
      'interets' => $this->faker->sentence,
      'education' => $this->faker->sentence,
      'liens_sociaux' => json_encode([
        'facebook' => 'https://facebook.com/' . $this->faker->userName,
        'twitter' => 'https://twitter.com/' . $this->faker->userName,
        'instagram' => 'https://instagram.com/' . $this->faker->userName,
      ]),
      'status' => $status,
      'last_active_at' => $lastActiveAt,
    ];
  }

  private function coverImageUrl(): string
  {
    $ids = [
      'photo-1506744038136-46273834b3fb',
      'photo-1501785888041-af3ef285b470',
      'photo-1470071459604-3b5ec3a7fe05',
      'photo-1469474968028-56623f02e42e',
      'photo-1441974231531-c6227db76b6e',
      'photo-1534972195531-b367aadb2cced',
      'photo-1507525428034-b723cf961d3e',
      'photo-1502082553048-f009c37129b9',
      'photo-1519681393784-d120267933ba',
      'photo-1482192596544-9eb780fc7f66',
    ];

    return 'https://images.unsplash.com/' . fake()->randomElement($ids) . '?w=800&h=300&fit=crop&auto=format&q=80';
  }

  public function unverified(): static
  {
    return $this->state(fn (array $attributes) => [
      'email_verified_at' => null,
    ]);
  }
}

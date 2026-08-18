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

    return [
      'first_name' => $firstName,
      'last_name' => $lastName,
      'username' => $username,
      'email' => fake()->unique()->safeEmail(),
      'email_verified_at' => now(),
      'password' => static::$password ??= Hash::make('12345678'),
      'avatar' => $avatar,
      'date_de_naissance' => $this->faker->date,
      // Unsplash: free random images, no key needed
      'cover_image' => "https://picsum.photos/seed/{$username}/800/300",
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
    ];
  }

  public function unverified(): static
  {
    return $this->state(fn (array $attributes) => [
      'email_verified_at' => null,
    ]);
  }
}

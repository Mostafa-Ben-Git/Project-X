<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
  /**
   * The current password being used by the factory.
   */
  protected static ?string $password;

  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    $firstName = fake()->firstName;
    $lastName = fake()->lastName;

    return [
      'first_name' => $firstName,
      'last_name' => $lastName,
      'username' => str_split($lastName, 5)[0] . random_int(100, 999),
      'email' => fake()->unique()->safeEmail(),
      'email_verified_at' => now(),
      'password' => static::$password ??= Hash::make('12345678'),
      'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($firstName . ' ' . $lastName),
      'date_de_naissance' => $this->faker->date,
      'cover_image' => $this->faker->imageUrl(),
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
      ])

      // 'remember_token' => Str::random(10),
    ];
  }

  /**
   * Indicate that the model's email address should be unverified.
   */
  public function unverified(): static
  {
    return $this->state(fn (array $attributes) => [
      'email_verified_at' => null,
    ]);
  }
}

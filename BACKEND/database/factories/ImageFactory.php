<?php

namespace Database\Factories;

use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

class ImageFactory extends Factory
{
    public function definition(): array
    {
        // Lorem Picsum: free random photos, no key needed
        $id = fake()->unique()->numberBetween(1, 1084);
        return [
            "post_id" => Post::factory(),
            "image_path" => "https://picsum.photos/id/{$id}/800/600",
        ];
    }
}

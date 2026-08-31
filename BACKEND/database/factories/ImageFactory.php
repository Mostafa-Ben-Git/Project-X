<?php

namespace Database\Factories;

use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

class ImageFactory extends Factory
{
    public function definition(): array
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
            'photo-1501854140801-50d01698950b',
            'photo-1523906834658-6e24ef2386f9',
            'photo-1470770841072-f978cf4d019e',
            'photo-1518837695005-2083093ee35b',
            'photo-1433086966358-54859d0ed716',
        ];

        return [
            'post_id' => Post::factory(),
            'image_path' => 'https://images.unsplash.com/' . fake()->randomElement($ids) . '?w=800&h=600&fit=crop&auto=format&q=80',
        ];
    }
}

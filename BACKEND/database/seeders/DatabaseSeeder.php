<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        \App\Models\User::factory()->create([
            'email' => 'test@example.com',
            'first_name' => 'test',
            'last_name' => 'test',
        ]);
        \App\Models\User::factory()->create([
            'email' => 'postman@example.com',
            "first_name" => "postman",
            "last_name" => "postman",
        ]);

        \App\Models\User::factory(10)->create();
        \App\Models\Post::factory(100)->create();
        \App\Models\Image::factory(100)->create();
        \App\Models\Like::factory(200)->create();
        $this->call(FriendSeeder::class);
        \App\Models\Comment::factory(200)->create();
    }
}

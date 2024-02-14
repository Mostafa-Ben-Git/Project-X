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

        // \App\Models\User::factory()->create([
        //     'name' => 'Most',
        //     'email' => 'test@example.com',
        // ]);
        \App\Models\User::factory(10)->create();

        \App\Models\Post::factory(10)->create();
        \App\Models\Like::factory(7)->create();
        \App\Models\Friend::factory(7)->create();
        \App\Models\Comment::factory(7)->create();
    }
}

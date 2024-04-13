<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FriendSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 0; $i < 40; $i++) {
            DB::table('friends')->insert([
                'user_id' => User::all()->random()->id,
                'friend_id' => User::all()->random()->id
            ]);
        }
    }
}

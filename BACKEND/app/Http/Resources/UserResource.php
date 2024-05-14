<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $liens_sociaux = [
            'facebook' => 'https://facebook.com/' . $this->faker->userName,
            'twitter' => 'https://twitter.com/' . $this->faker->userName,
            'instagram' => 'https://instagram.com/' . $this->faker->userName,
        ];
        $liens_sociaux_encoded = json_encode($liens_sociaux);
        
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'friends_count' => $this->friends->count(),
            'date_de_naissance'=>$this->date_de_naissance,
            'ville_habituelle'=>$this->ville_habituelle,
            'liens_sociaux' => $liens_sociaux_encoded,
            'posts_count' => $this->posts->count(),
            'education'=>$this->education,
            'friends' => $this->friends->map(fn ($friend) => [
                "id" => $friend->id,
                "username" => $friend->username,
                "full_name" => $friend->first_name . ' ' . $friend->last_name,
                'avatar' => $friend->avatar
                
            ])->toArray(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}

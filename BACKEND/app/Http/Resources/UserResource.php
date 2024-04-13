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
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'friends_count' => $this->friends->count(),
            'posts_count' => $this->posts->count(),
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

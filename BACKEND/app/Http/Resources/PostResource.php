<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public static $wrap = null;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'post_id' => $this->id,
            'text' => $this->text,
            'image' => $this->image,
            'likes' => $this->likes->count(),
            'longAgo' => $this->created_at->diffForHumans(),
            'user' => [
                'id' => $this->user->id,
                'first_name' => $this->user->first_name,
                'last_name' => $this->user->last_name,
                'email' => $this->user->email,
                'avatar' => $this->user->avatar,
                'friends_count' => $this->user->friends->count(),
                'posts_count' => $this->user->posts->count(),
            ],
            // 'comments' => CommentResource::collection($this->comments)

        ];
    }
}

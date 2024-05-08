<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'post_id' => $this->id,
            'user_id' => $this->user_id,
            'username' => $this->user->username,
            'text' => $this->text,
            'image' => $this->image,
            'longAgo' => $this->created_at->diffForHumans(),
            'likes' => $this->likes->count(),
            'comments' => CommentResource::collection($this->comments)

        ];
    }
}

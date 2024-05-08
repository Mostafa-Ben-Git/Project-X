<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'commentId' => $this->id,
            'comment' => $this->comment,
            'created_at' => $this->created_at,
            'userId' => $this->user_id,
        ];
    }
}

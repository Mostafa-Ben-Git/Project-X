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
      'description' => $this->comment,
      'longAgo' => $this->created_at->diffForHumans(),
      'user' => [
        'id' => $this->user->id,
        'first_name' => $this->user->first_name,
        'last_name' => $this->user->last_name,
        'username' => $this->user->username,
        'email' => $this->user->email,
        'avatar' => $this->user->avatar,
        'bio' => $this->user->bio,
        'friends_count' => $this->user->friends->count(),
        'posts_count' => $this->user->posts->count(),
      ],
    ];
  }
}

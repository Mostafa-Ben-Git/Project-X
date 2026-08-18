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
    $user = $this->whenLoaded('user');

    return [
      'commentId' => $this->id,
      'description' => $this->comment,
      'longAgo' => $this->created_at?->diffForHumans(),
      'user' => $user ? [
        'id' => $user->id,
        'first_name' => $user->first_name,
        'last_name' => $user->last_name,
        'username' => $user->username,
        'email' => $user->email,
        'avatar' => $user->avatar,
        'bio' => $user->bio,
        'posts_count' => $user->whenLoaded('posts', fn() => $user->posts->count(), 0),
      ] : null,
    ];
  }
}

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
    $user = $this->whenLoaded('user');

    return [
      'post_id' => $this->id,
      'parent_id' => $this->parent_id,
      'content' => $this->content,
      'user_id' => $this->user_id,
      'images' => $this->whenLoaded('images', function () {
        return $this->images->map(function ($image) {
          return $image->image_path;
        });
      }, []),
      'dates' => [
        'created_at' => $this->created_at,
        'date' => $this->created_at?->format('M d, Y'),
        'time' => $this->created_at?->format('H:i'),
        'ago' => $this->created_at?->diffForHumans(),
      ],
      'info' => [
        'is_liked' => $this->isLiked(),
        'likes' => $this->whenLoaded('likes', fn() => $this->likes->count(), 0),
        'comments_count' => $this->whenLoaded('comments', fn() => $this->comments->count(), 0),
      ],
      'user' => $user ? [
        'id' => $user->id,
        'first_name' => $user->first_name,
        'last_name' => $user->last_name,
        'username' => $user->username,
        'email' => $user->email,
        'avatar' => $user->avatar,
        'bio' => $user->bio,
        'joined_at' => $user->created_at?->diffForHumans(),
        'followers_count' => $user->followers_count ?? $user->followers->count(),
        'following_count' => $user->followings_count ?? $user->followings->count(),
        'posts_count' => $user->posts_count ?? $user->posts->count(),
      ] : null,
    ];
  }
}

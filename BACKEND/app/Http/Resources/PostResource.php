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
      'parent_id' => $this->parent_id,
      'content' => $this->content,
      $this->mergeWhen($this->images->count() > 0, [
        'images' => $this->images->map(function ($image) {
          return $image->image_path;
        })
      ]),
      'dates' => [
        "created_at" => $this->created_at,
        "date" => $this->created_at->format('M d, Y'),
        "time" => $this->created_at->format('H:i'),
        "ago" => $this->created_at->diffForHumans(),

      ],
      "info" => [
        "is_liked" => $this->isLiked(),
        'likes' => $this->likes->count(),
        "comments_count" => $this->comments->count(),

      ],
      'user' => [
        'id' => $this->user->id,
        'first_name' => $this->user->first_name,
        'last_name' => $this->user->last_name,
        'username' => $this->user->username,
        'email' => $this->user->email,
        'avatar' => $this->user->avatar,
        'bio' => $this->user->bio,
        "joined_at" => $this->user->created_at->diffForHumans(),
        'followers_count' => $this->user->followers->count(),
        'following_count' => $this->user->followings->count(),
        'posts_count' => $this->user->posts->count(),
      ],
      // $this->mergeWhen($this->comments->isNotEmpty() && $request->comments === 'true', [
      //   'comments' => CommentResource::collection($this->comments)
      // ])

    ];
  }
}

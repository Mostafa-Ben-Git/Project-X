<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
  public static $wrap = null;

  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'type' => $this->type,
      'content' => $this->content,
      'count' => $this->count ?? 1,
      'read_at' => $this->read_at,
      'created_at' => $this->created_at,
      'ago' => $this->created_at->diffForHumans(),
      'from_user' => [
        'id' => $this->fromUser?->id,
        'first_name' => $this->fromUser?->first_name,
        'last_name' => $this->fromUser?->last_name,
        'username' => $this->fromUser?->username,
        'avatar' => $this->fromUser?->avatar,
      ],
      'post_id' => $this->post_id,
    ];
  }
}

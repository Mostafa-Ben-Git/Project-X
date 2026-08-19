<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
  public static $wrap = null;

  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'content' => $this->content,
      'sender_id' => $this->sender_id,
      'receiver_id' => $this->receiver_id,
      'read_at' => $this->read_at,
      'created_at' => $this->created_at,
      'ago' => $this->created_at->diffForHumans(),
      'unread_count' => (int) ($this->unread_count ?? 0),
      'sender' => [
        'id' => $this->sender?->id,
        'first_name' => $this->sender?->first_name,
        'last_name' => $this->sender?->last_name,
        'username' => $this->sender?->username,
        'avatar' => $this->sender?->avatar,
        'status' => $this->sender?->status,
        'last_active_at' => $this->sender?->last_active_at?->toIso8601String(),
      ],
      'receiver' => [
        'id' => $this->receiver?->id,
        'first_name' => $this->receiver?->first_name,
        'last_name' => $this->receiver?->last_name,
        'username' => $this->receiver?->username,
        'avatar' => $this->receiver?->avatar,
        'status' => $this->receiver?->status,
        'last_active_at' => $this->receiver?->last_active_at?->toIso8601String(),
      ],
    ];
  }
}

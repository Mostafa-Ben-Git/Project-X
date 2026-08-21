<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
  public static $wrap = null;

  public function toArray(Request $request): array
  {
    $authId = $request->user()?->id;
    // Secure room token: encrypted partner id (never expose raw UUID in URL)
    $partnerId = $this->sender_id === $authId ? $this->receiver_id : $this->sender_id;
    $room = null;
    try {
      if ($partnerId) {
        $enc = \Illuminate\Support\Facades\Crypt::encryptString($partnerId);
        $room = rtrim(strtr($enc, '+/', '-_'), '=');
      }
    } catch (\Throwable $e) {
      $room = null;
    }

    $reply = $this->whenLoaded('replyTo');
    return [
      'id' => $this->id,
      'content' => $this->content,
      'image_url' => $this->image_path ? asset($this->image_path) : null,
      'type' => $this->type ?? ($this->image_path ? 'image' : 'text'),
      'sender_id' => $this->sender_id,
      'receiver_id' => $this->receiver_id,
      'reply_to_id' => $this->reply_to_id,
      'is_pinned' => (bool) $this->is_pinned,
      'pinned_at' => $this->pinned_at?->toIso8601String(),
      'is_mine' => $authId ? $this->sender_id === $authId : false,
      'can_delete' => $authId ? ($this->sender_id === $authId || $this->receiver_id === $authId) : false,
      'read_at' => $this->read_at,
      'created_at' => $this->created_at,
      'ago' => $this->created_at->diffForHumans(),
      'unread_count' => (int) ($this->unread_count ?? 0),
      'room' => $room,
      'reply_to' => $reply ? [
        'id' => $reply->id,
        'content' => $reply->content ? \Illuminate\Support\Str::limit($reply->content, 80) : null,
        'image_url' => $reply->image_path ? asset($reply->image_path) : null,
        'sender_id' => $reply->sender_id,
      ] : null,
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

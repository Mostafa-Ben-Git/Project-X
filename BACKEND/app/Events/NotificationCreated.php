<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Notification $notification;

    public function __construct(Notification $notification)
    {
        $this->notification = $notification;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->notification->user_id),
        ];
    }

    public function broadcastAs()
    {
        return 'notification.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'type' => $this->notification->type,
            'content' => $this->notification->content,
            'post_id' => $this->notification->post_id,
            'from_user' => $this->notification->fromUser ? [
                'id' => $this->notification->fromUser->id,
                'first_name' => $this->notification->fromUser->first_name,
                'last_name' => $this->notification->fromUser->last_name,
                'username' => $this->notification->fromUser->username,
                'avatar' => $this->notification->fromUser->avatar,
            ] : null,
            'created_at' => $this->notification->created_at?->toIso8601String(),
        ];
    }
}

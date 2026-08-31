<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserStatusBroadcast implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public User $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Broadcast on the presence channel so ALL connected users receive it.
     */
    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('online-users'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'user.status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->user->id,
            'username' => $this->user->username,
            ...$this->user->presenceFor(null),
        ];
    }
}

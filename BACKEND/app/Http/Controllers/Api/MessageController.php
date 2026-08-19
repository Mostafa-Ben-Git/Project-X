<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
  /**
   * List all conversations for the authenticated user.
   * Returns the latest message per unique partner.
   */
  public function conversations(Request $request)
  {
    $userId = $request->user()->id;

    // Get the latest message for each unique partner
    $conversations = Message::where('sender_id', $userId)
      ->orWhere('receiver_id', $userId)
      ->with('sender:id,first_name,last_name,username,avatar')
      ->with('receiver:id,first_name,last_name,username,avatar')
      ->latest('created_at')
      ->get()
      ->groupBy(function ($message) use ($userId) {
        return $message->sender_id === $userId
          ? $message->receiver_id
          : $message->sender_id;
      })
      ->map(function ($messages) use ($userId) {
        $last = $messages->first();
        // Count unread messages from this partner
        $partnerId = $last->sender_id === $userId ? $last->receiver_id : $last->sender_id;
        $unread = Message::where('sender_id', $partnerId)
          ->where('receiver_id', $userId)
          ->whereNull('read_at')
          ->count();
        $last->unread_count = $unread;
        return $last;
      })
      ->values();

    return MessageResource::collection($conversations);
  }

  /**
   * Get messages between the authenticated user and a specific user.
   */
  public function messagesWith(Request $request, User $user)
  {
    $userId = $request->user()->id;

    $messages = Message::where(function ($query) use ($userId, $user) {
        $query->where('sender_id', $userId)->where('receiver_id', $user->id);
      })
      ->orWhere(function ($query) use ($userId, $user) {
        $query->where('sender_id', $user->id)->where('receiver_id', $userId);
      })
      ->with('sender:id,first_name,last_name,username,avatar')
      ->with('receiver:id,first_name,last_name,username,avatar')
      ->orderBy('created_at', 'asc')
      ->paginate(50);

    // Mark messages from the other user as read
    Message::where('sender_id', $user->id)
      ->where('receiver_id', $userId)
      ->whereNull('read_at')
      ->update(['read_at' => now()]);

    return MessageResource::collection($messages);
  }

  /**
   * Send a message to a user.
   */
  public function send(Request $request, User $user)
  {
    $request->validate([
      'content' => 'required|string|max:5000',
    ]);

    $sender = $request->user();

    if ($sender->id === $user->id) {
      return response()->json(['message' => 'Cannot send message to yourself'], 422);
    }

    $message = Message::create([
      'sender_id' => $sender->id,
      'receiver_id' => $user->id,
      'content' => $request->content,
    ]);

    // Broadcast the new message in realtime to both participants.
    \App\Support\Broadcast::safe(new \App\Events\MessageSent($message));

    // Create notification for the receiver (model triggers realtime broadcast)
    Notification::create([
      'user_id' => $user->id,
      'from_user_id' => $sender->id,
      'type' => 'message',
      'content' => substr($request->content, 0, 100),
      'message_id' => $message->id,
    ]);

    return new MessageResource($message->load('sender:id,first_name,last_name,username,avatar'));
  }

  /**
   * Get unread message count.
   */
  public function unreadCount(Request $request)
  {
    $count = Message::where('receiver_id', $request->user()->id)
      ->whereNull('read_at')
      ->count();

    return response()->json(['count' => $count]);
  }
}

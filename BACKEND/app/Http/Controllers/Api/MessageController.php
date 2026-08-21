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
   * Helper: build secure room token for a partner (URL-safe: no raw / in path).
   */
  private function roomFor(string $partnerId): string
  {
    $enc = \Illuminate\Support\Facades\Crypt::encryptString($partnerId);
    // Make URL-safe (base64url without padding issues) — replace +/ with -_
    return rtrim(strtr($enc, '+/', '-_'), '=');
  }

  private function resolveRoom(string $room, Request $request): ?User
  {
    try {
      // Restore base64 padding and chars before decrypt
      $b64 = strtr($room, '-_', '+/');
      $pad = strlen($b64) % 4;
      if ($pad) $b64 .= str_repeat('=', 4 - $pad);
      $partnerId = \Illuminate\Support\Facades\Crypt::decryptString($b64);
      $user = User::find($partnerId);
      if (!$user) return null;
      if ($user->id === $request->user()->id) return null;
      return $user;
    } catch (\Throwable $e) {
      // Fallback: try raw decrypt for legacy tokens
      try {
        $partnerId = \Illuminate\Support\Facades\Crypt::decryptString($room);
        $user = User::find($partnerId);
        if (!$user || $user->id === $request->user()->id) return null;
        return $user;
      } catch (\Throwable $e2) {
        return null;
      }
    }
  }

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
      ->with('sender:id,first_name,last_name,username,avatar,status,last_active_at')
      ->with('receiver:id,first_name,last_name,username,avatar,status,last_active_at')
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
   * Reverse pagination: latest messages first (page 1 = newest 20), frontend reverses for asc display.
   * Scroll up loads older pages.
   */
  public function messagesWith(Request $request, User $user)
  {
    $userId = $request->user()->id;
    $perPage = (int) $request->query('per_page', 20);

    $messages = Message::where(function ($query) use ($userId, $user) {
        $query->where('sender_id', $userId)->where('receiver_id', $user->id);
      })
      ->orWhere(function ($query) use ($userId, $user) {
        $query->where('sender_id', $user->id)->where('receiver_id', $userId);
      })
      ->with(['replyTo', 'sender:id,first_name,last_name,username,avatar,status,last_active_at', 'receiver:id,first_name,last_name,username,avatar,status,last_active_at'])
      ->latest('created_at')
      ->paginate($perPage);

    // Mark messages from the other user as read
    Message::where('sender_id', $user->id)
      ->where('receiver_id', $userId)
      ->whereNull('read_at')
      ->update(['read_at' => now()]);

    return MessageResource::collection($messages);
  }

  /**
   * Reply to a message in a secure room.
   */
  public function reply(Request $request, string $room, string $message)
  {
    $partner = $this->resolveRoom($room, $request);
    if (!$partner) return response()->json(['message' => 'Invalid room'], 404);

    $parent = Message::find($message);
    if (!$parent || !in_array($parent->sender_id, [$request->user()->id, $partner->id]) || !in_array($parent->receiver_id, [$request->user()->id, $partner->id])) {
      return response()->json(['message' => 'Message not found in this room'], 404);
    }

    $request->validate([
      'content' => 'nullable|string|max:5000',
      'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
    ]);
    if (empty($request->content) && !$request->hasFile('image')) {
      return response()->json(['message' => 'Reply content or image required'], 422);
    }

    $imagePath = null;
    $type = 'text';
    if ($request->hasFile('image')) {
      $file = $request->file('image');
      $name = time() . '_' . \Illuminate\Support\Str::random(8) . '.' . $file->getClientOriginalExtension();
      $file->move(public_path('images/messages'), $name);
      $imagePath = 'images/messages/' . $name;
      $type = $request->filled('content') ? 'mixed' : 'image';
    }

    $msg = Message::create([
      'sender_id' => $request->user()->id,
      'receiver_id' => $partner->id,
      'content' => $request->content,
      'image_path' => $imagePath,
      'type' => $type,
      'reply_to_id' => $parent->id,
    ]);

    \App\Support\Broadcast::safe(new \App\Events\MessageSent($msg));
    Notification::create([
      'user_id' => $partner->id,
      'from_user_id' => $request->user()->id,
      'type' => 'message',
      'content' => $msg->content ? substr($msg->content, 0, 100) : ($msg->image_path ? '📷 Replied with image' : 'Replied'),
      'message_id' => $msg->id,
    ]);

    return new MessageResource($msg->load(['replyTo', 'sender:id,first_name,last_name,username,avatar']));
  }

  /**
   * Delete a message (soft delete, for both participants).
   */
  public function destroy(Request $request, string $room, string $message)
  {
    $partner = $this->resolveRoom($room, $request);
    if (!$partner) return response()->json(['message' => 'Invalid room'], 404);
    $msg = Message::find($message);
    if (!$msg || !in_array($msg->sender_id, [$request->user()->id, $partner->id]) || !in_array($msg->receiver_id, [$request->user()->id, $partner->id])) {
      return response()->json(['message' => 'Message not found'], 404);
    }
    if (!$msg->canDelete($request->user())) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }
    $msg->delete();
    // Broadcast deletion (best-effort)
    \App\Support\Broadcast::safe(new \App\Events\MessageSent($msg->fresh())); // reuse; frontend will refetch
    return response()->json(['message' => 'Deleted'], 200);
  }

  /**
   * Restore a soft-deleted message (undo).
   */
  public function restore(Request $request, string $room, string $message)
  {
    $partner = $this->resolveRoom($room, $request);
    if (!$partner) return response()->json(['message' => 'Invalid room'], 404);
    $msg = Message::withTrashed()->find($message);
    if (!$msg || $msg->sender_id !== $request->user()->id) {
      return response()->json(['message' => 'Not found or not owner'], 404);
    }
    $msg->restore();
    return new MessageResource($msg->load(['replyTo', 'sender']));
  }

  /**
   * Pin / unpin a message.
   */
  public function togglePin(Request $request, string $room, string $message)
  {
    $partner = $this->resolveRoom($room, $request);
    if (!$partner) return response()->json(['message' => 'Invalid room'], 404);
    $msg = Message::find($message);
    if (!$msg || !in_array($msg->sender_id, [$request->user()->id, $partner->id]) || !in_array($msg->receiver_id, [$request->user()->id, $partner->id])) {
      return response()->json(['message' => 'Message not found'], 404);
    }

    $isPinned = !$msg->is_pinned;
    if ($isPinned) {
      $pinnedCount = Message::where(function ($q) use ($request, $partner) {
        $q->where('sender_id', $request->user()->id)->where('receiver_id', $partner->id);
      })->orWhere(function ($q) use ($request, $partner) {
        $q->where('sender_id', $partner->id)->where('receiver_id', $request->user()->id);
      })->where('is_pinned', true)->count();
      if ($pinnedCount >= 3) {
        return response()->json(['message' => 'Pin limit reached (3)'], 422);
      }
      $msg->update(['is_pinned' => true, 'pinned_at' => now(), 'pinned_by' => $request->user()->id]);
    } else {
      $msg->update(['is_pinned' => false, 'pinned_at' => null, 'pinned_by' => null]);
    }
    \App\Support\Broadcast::safe(new \App\Events\MessageSent($msg->fresh()));
    return new MessageResource($msg->load(['replyTo', 'sender', 'receiver']));
  }

  /**
   * Get pinned messages in room.
   */
  public function pinned(Request $request, string $room)
  {
    $partner = $this->resolveRoom($room, $request);
    if (!$partner) return response()->json(['message' => 'Invalid room'], 404);
    $uid = $request->user()->id;
    $msgs = Message::where('is_pinned', true)->where(function ($q) use ($uid, $partner) {
      $q->where(function ($qq) use ($uid, $partner) { $qq->where('sender_id', $uid)->where('receiver_id', $partner->id); })
        ->orWhere(function ($qq) use ($uid, $partner) { $qq->where('sender_id', $partner->id)->where('receiver_id', $uid); });
    })->with(['replyTo', 'sender', 'receiver'])->latest('pinned_at')->get();
    return MessageResource::collection($msgs);
  }

  /**
   * Send a message to a user (supports text + emoji + image).
   */
  public function send(Request $request, User $user)
  {
    $request->validate([
      'content' => 'nullable|string|max:5000',
      'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
    ]);

    if (empty($request->content) && !$request->hasFile('image')) {
      return response()->json(['message' => 'Message content or image required'], 422);
    }

    $sender = $request->user();

    if ($sender->id === $user->id) {
      return response()->json(['message' => 'Cannot send message to yourself'], 422);
    }

    $imagePath = null;
    $type = 'text';
    if ($request->hasFile('image')) {
      $file = $request->file('image');
      $name = time() . '_' . \Illuminate\Support\Str::random(8) . '.' . $file->getClientOriginalExtension();
      $file->move(public_path('images/messages'), $name);
      $imagePath = 'images/messages/' . $name;
      $type = $request->filled('content') ? 'mixed' : 'image';
    } elseif (!empty($request->content)) {
      $type = 'text';
    }

    $message = Message::create([
      'sender_id' => $sender->id,
      'receiver_id' => $user->id,
      'content' => $request->content,
      'image_path' => $imagePath,
      'type' => $type,
    ]);

    // Broadcast the new message in realtime to both participants.
    \App\Support\Broadcast::safe(new \App\Events\MessageSent($message));

    // Create notification for the receiver (model triggers realtime broadcast)
    $notifContent = $message->content ? substr($message->content, 0, 100) : ($message->image_path ? '📷 Image' : '');
    Notification::create([
      'user_id' => $user->id,
      'from_user_id' => $sender->id,
      'type' => 'message',
      'content' => $notifContent,
      'message_id' => $message->id,
    ]);

    return new MessageResource($message->load('sender:id,first_name,last_name,username,avatar'));
  }

  /**
   * Resolve room token to partner user, or fail.
   */
  public function resolveRoomToken(Request $request, string $room)
  {
    $partner = $this->resolveRoom($room, $request);
    if (!$partner) {
      return response()->json(['message' => 'Invalid or expired room'], 404);
    }
    return response()->json(['partner' => $partner, 'room' => $room]);
  }

  /**
   * Get messages by secure room token.
   */
  public function messagesByRoom(Request $request, string $room)
  {
    $partner = $this->resolveRoom($room, $request);
    if (!$partner) {
      return response()->json(['message' => 'Invalid or expired room'], 404);
    }
    return $this->messagesWith($request, $partner);
  }

  /**
   * Send message to secure room token.
   */
  public function sendToRoom(Request $request, string $room)
  {
    $partner = $this->resolveRoom($room, $request);
    if (!$partner) {
      return response()->json(['message' => 'Invalid or expired room'], 404);
    }
    return $this->send($request, $partner);
  }

  /**
   * Create / get room token for a partner (secure URL).
   */
  public function roomForUser(Request $request, User $user)
  {
    if ($request->user()->id === $user->id) {
      return response()->json(['message' => 'Cannot create room with yourself'], 422);
    }
    return response()->json(['room' => $this->roomFor($user->id), 'partner' => $user]);
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

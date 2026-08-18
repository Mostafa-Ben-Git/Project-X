<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
  /**
   * List all notifications for the authenticated user.
   */
  public function index(Request $request)
  {
    $notifications = Notification::where('user_id', $request->user()->id)
      ->with('fromUser')
      ->latest()
      ->paginate(20);

    return NotificationResource::collection($notifications);
  }

  /**
   * Get unread count.
   */
  public function unreadCount(Request $request)
  {
    $count = Notification::where('user_id', $request->user()->id)
      ->unread()
      ->count();

    return response()->json(['count' => $count]);
  }

  /**
   * Mark a single notification as read.
   */
  public function markAsRead(Request $request, Notification $notification)
  {
    if ($notification->user_id !== $request->user()->id) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    $notification->markAsRead();

    return response()->json(['message' => 'Notification marked as read']);
  }

  /**
   * Mark all notifications as read.
   */
  public function markAllAsRead(Request $request)
  {
    Notification::where('user_id', $request->user()->id)
      ->unread()
      ->update(['read_at' => now()]);

    return response()->json(['message' => 'All notifications marked as read']);
  }
}

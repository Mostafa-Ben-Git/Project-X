<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
  use HasFactory, HasUuids;

  protected static function booted(): void
  {
    // Broadcast every newly-created notification in realtime.
    static::created(function (Notification $notification) {
      \App\Support\Broadcast::safe(new \App\Events\NotificationCreated($notification));
    });
  }

  protected $fillable = [
    'user_id',
    'from_user_id',
    'type',
    'content',
    'post_id',
    'message_id',
    'count',
    'read_at',
  ];

  protected $casts = [
    'read_at' => 'datetime',
  ];

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function fromUser()
  {
    return $this->belongsTo(User::class, 'from_user_id');
  }

  public function post()
  {
    return $this->belongsTo(Post::class);
  }

  public function markAsRead()
  {
    $this->update(['read_at' => now()]);
  }

  public function scopeUnread($query)
  {
    return $query->whereNull('read_at');
  }
}

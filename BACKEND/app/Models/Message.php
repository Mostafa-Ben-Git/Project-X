<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
  use HasFactory, HasUuids, SoftDeletes;

  protected $fillable = [
    'sender_id',
    'receiver_id',
    'content',
    'image_path',
    'type',
    'reply_to_id',
    'is_pinned',
    'pinned_at',
    'pinned_by',
    'read_at',
  ];

  protected $casts = [
    'read_at' => 'datetime',
    'pinned_at' => 'datetime',
    'is_pinned' => 'boolean',
  ];

  public function sender(): BelongsTo
  {
    return $this->belongsTo(User::class, 'sender_id');
  }

  public function receiver(): BelongsTo
  {
    return $this->belongsTo(User::class, 'receiver_id');
  }

  public function replyTo(): BelongsTo
  {
    return $this->belongsTo(Message::class, 'reply_to_id');
  }

  public function replies()
  {
    return $this->hasMany(Message::class, 'reply_to_id');
  }

  public function scopePinned($query)
  {
    return $query->where('is_pinned', true);
  }

  public function canDelete($user): bool
  {
    if (!$user) return false;
    return $user->id === $this->sender_id || $user->id === $this->receiver_id;
  }

  public function markAsRead(): void
  {
    $this->update(['read_at' => now()]);
  }

  /**
   * Check if this message has been read.
   */
  public function isRead(): bool
  {
    return $this->read_at !== null;
  }

  /**
   * Scope to get only unread messages.
   */
  public function scopeUnread($query)
  {
    return $query->whereNull('read_at');
  }
}

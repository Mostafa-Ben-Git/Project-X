<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
  use HasFactory, HasUuids;

  protected $fillable = [
    'sender_id',
    'receiver_id',
    'content',
    'image_path',
    'type',
    'read_at',
  ];

  protected $casts = [
    'read_at' => 'datetime',
  ];

  public function sender(): BelongsTo
  {
    return $this->belongsTo(User::class, 'sender_id');
  }

  public function receiver(): BelongsTo
  {
    return $this->belongsTo(User::class, 'receiver_id');
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

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Like extends Model
{
  use HasFactory, HasUuids;

  protected $fillable = [
    'user_id',
  ];

  public function post(): BelongsTo
  {
    return $this->belongsTo(Post::class);
  }

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }
}

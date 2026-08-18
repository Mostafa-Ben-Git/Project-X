<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
  use HasFactory, SoftDeletes;

  protected $fillable = [
    'content', 'images', 'user_id', 'parent_id',
  ];

  protected $with = ['user', 'images'];

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  public function likes(): HasMany
  {
    return $this->hasMany(Like::class);
  }

  public function parent(): BelongsTo
  {
    return $this->belongsTo(Post::class, 'parent_id');
  }

  public function comments(): HasMany
  {
    return $this->hasMany(Post::class, 'parent_id');
  }

  public function images(): HasMany
  {
    return $this->hasMany(Image::class);
  }

  /**
   * Check if the post is liked by the authenticated user.
   * Returns false if no user is authenticated.
   */
  public function isLiked(): bool
  {
    if (!auth()->check()) {
      return false;
    }

    return $this->likes()->where('user_id', auth()->id())->exists();
  }
}

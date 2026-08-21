<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
  use HasFactory, SoftDeletes, HasUuids;

  protected $fillable = [
    'content', 'images', 'user_id', 'parent_id', 'views_count',
  ];

  protected $with = ['user', 'images'];

  protected $casts = [
    'views_count' => 'integer',
  ];

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  public function likes(): HasMany
  {
    return $this->hasMany(Like::class);
  }

  public function reposts(): HasMany
  {
    return $this->hasMany(Repost::class);
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

  public function bookmarks(): HasMany
  {
    return $this->hasMany(Bookmark::class);
  }

  public function views(): HasMany
  {
    return $this->hasMany(PostView::class);
  }

  public function isBookmarked(): bool
  {
    if (!auth()->check()) {
      return false;
    }

    return $this->bookmarks()->where('user_id', auth()->id())->exists();
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

  /**
   * Check if the post is reposted by the authenticated user.
   * Returns false if no user is authenticated.
   */
  public function isReposted(): bool
  {
    if (!auth()->check()) {
      return false;
    }

    return $this->reposts()->where('user_id', auth()->id())->exists();
  }
}

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
    'title', 'images'
  ];

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }
  public function likes(): HasMany
  {
    return $this->hasMany(Like::class);
  }
  public function parent()
  {
    return $this->belongsTo(Post::class, 'parent_id');
  }

  public function comments()
  {
    return $this->hasMany(Post::class, 'parent_id');
  }

  public function images(): HasMany
  {
    return $this->hasMany(Image::class);
  }
  public function isliked()
  {
    return $this->likes()->where('user_id', auth()->user()->id)->exists();
  }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
  use HasApiTokens, HasFactory, Notifiable;

  protected $fillable = [
    'first_name',
    'last_name',
    'avatar',
    'cover_image',
    'username',
    'email',
    'password',
    'bio',
    'date_de_naissance',
    'statut',
    'genre',
    'adresse',
    'ville_origine',
    'ville_habituelle',
    'situation_amoureuse',
    'interets',
    'education',
    'liens_sociaux',
    'phone',
    'website',
    'location',
    'is_private',
    'language',
    'status',
  ];

  protected $hidden = [
    'password',
    'remember_token',
  ];

  protected $casts = [
    'email_verified_at' => 'datetime',
    'password' => 'hashed',
    'liens_sociaux' => 'array',
  ];

  public function followers()
  {
    return $this->belongsToMany(User::class, 'followers', 'following_id', 'follower_id')
      ->withTimestamps();
  }

  public function followings()
  {
    return $this->belongsToMany(User::class, 'followers', 'follower_id', 'following_id')
      ->withTimestamps();
  }

  public function posts(): HasMany
  {
    return $this->hasMany(Post::class);
  }

  public function notifications(): HasMany
  {
    return $this->hasMany(Notification::class);
  }

  public function sentMessages(): HasMany
  {
    return $this->hasMany(Message::class, 'sender_id');
  }

  public function receivedMessages(): HasMany
  {
    return $this->hasMany(Message::class, 'receiver_id');
  }

  public function isFollowing(User $user): bool
  {
    return $this->followers()->where('users.id', $user->id)->exists();
  }

  public function suggestions()
  {
    $followingIds = $this->followings()->pluck('users.id');

    $suggestedUsers = User::whereNotIn('users.id', $followingIds)
      ->withCount('followers')
      ->get()
      ->sortByDesc('followers_count')
      ->take(4);

    return $suggestedUsers;
  }
}

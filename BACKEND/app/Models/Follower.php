<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class Follower extends Pivot
{
  use HasFactory, HasUuids;

  protected $table = 'followers';
  protected $fillable = [
    'follower_id',
    'following_id',
  ];

  public $incrementing = false;
  protected $keyType = 'string';
}

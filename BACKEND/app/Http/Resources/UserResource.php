<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
  public static $wrap = null;

  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    $dateOfBirth = $this->date_de_naissance ? Carbon::parse($this->date_de_naissance) : null;

    return [
      'id' => $this->id,
      'first_name' => $this->first_name,
      'username' => $this->username,
      'last_name' => $this->last_name,
      'email' => $this->email,
      'avatar' => $this->avatar,
      'cover_image' => $this->cover_image,
      'bio' => $this->bio,
      'statut' => $this->statut,
      'genre' => $this->genre,
      'adresse' => $this->adresse,
      'ville_origine' => $this->ville_origine,
      'ville_habituelle' => $this->ville_habituelle,
      'situation_amoureuse' => $this->situation_amoureuse,
      'interets' => $this->interets,
      'followers_count' => (int) ($this->followers_count ?? 0),
      'following_count' => (int) ($this->followings_count ?? 0),
      'is_following' => auth()->check() ? $this->isFollowing(auth()->user()) : false,
      'posts_count' => (int) ($this->posts_count ?? 0),
      'age' => $dateOfBirth ? $dateOfBirth->diffInYears(now()) : null,
      'date_de_naissance' => $this->date_de_naissance,
      'liens_sociaux' => $this->liens_sociaux,
      'education' => $this->education,
      'phone' => $this->phone,
      'website' => $this->website,
      'location' => $this->location,
      'is_private' => (bool) $this->is_private,
      'language' => $this->language,
      'status' => $this->status,
      'last_active_at' => $this->last_active_at?->toIso8601String(),
      'created_at' => $this->created_at?->toIso8601String(),
      'updated_at' => $this->updated_at?->toIso8601String(),
    ];
  }
}

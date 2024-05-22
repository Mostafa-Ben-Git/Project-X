<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   *
   */
  public static $wrap = null;
  public function toArray(Request $request): array
  {

    $dateOfBirth = Carbon::parse($this->date_de_naissance);

    return [
      'id' => $this->id,
      'first_name' => $this->first_name,
      'username' => $this->username,
      'last_name' => $this->last_name,
      'email' => $this->email,
      'avatar' => $this->avatar,
      'bio' => $this->bio,
      'followers_count' => $this->followers->count(),
      'following_count' => $this->following->count(),
      'posts_count' => $this->posts->count(),
      "age" => $dateOfBirth->diffInYears(now()),
      'date_de_naissance' => $this->date_de_naissance,
      'ville_habituelle' => $this->ville_habituelle,
      'liens_sociaux' => $this->liens_sociaux,
      'education' => $this->education,
      // 'followers' => UserResource::collection($this->followers),
      // 'following' => UserResource::collection($this->following),
      'created_at' => $this->created_at->toIso8601String(),
      'updated_at' => $this->updated_at->toIso8601String(),
    ];
  }
}

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
      'friends_count' => $this->friends->count(),
      "age" => $dateOfBirth->diffInYears(now()),
      'date_de_naissance' => $this->date_de_naissance,
      'ville_origine'=>$this->ville_origine,
      'ville_habituelle' => $this->ville_habituelle,
      'liens_sociaux' => json_decode($this->liens_sociaux),
      'posts_count' => $this->posts->count(),
      'education' => $this->education,
      'cover_image'=>$this->cover_image,

      'friends' => $this->friends->map(fn ($friend) => [
        "id" => $friend->id,
        "username" => $friend->username,
        "full_name" => $friend->first_name . ' ' . $friend->last_name,
        'avatar' => $friend->avatar

      ])->toArray(),
      'created_at' => $this->created_at->toIso8601String(),
      'updated_at' => $this->updated_at->toIso8601String(),
    ];
  }
}

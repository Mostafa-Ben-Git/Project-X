<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public static $wrap = null;

    /**
     * Eager-load everything the resource serializes as aggregate counts
     * (avoids N+1 queries: one query per relation instead of per row).
     */
    public static function prepare($query)
    {
        $userId = auth()->id();

        return $query
            ->with([
                'user' => fn ($q) => $q->withCount(['followers', 'followings', 'posts']),
            ])
            ->withCount([
                'likes',
                'comments',
                'reposts',
                'likes as liked_by_current_user' => fn ($q) => $q->where('user_id', $userId),
                'reposts as reposted_by_current_user' => fn ($q) => $q->where('user_id', $userId),
                'bookmarks as bookmarked_by_current_user' => fn ($q) => $q->where('user_id', $userId),
            ]);
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'post_id' => $this->id,
            'parent_id' => $this->parent_id,
            'is_pinned' => (bool) $this->is_pinned,
            'content' => $this->content,
            'user_id' => $this->user_id,
            'images' => $this->whenLoaded('images', function () {
                return $this->images->map(function ($image) {
                    return $image->image_path;
                });
            }, []),
            'dates' => [
                'created_at' => $this->created_at,
                'date' => $this->created_at?->format('M d, Y'),
                'time' => $this->created_at?->format('H:i'),
                'ago' => $this->created_at?->diffForHumans(),
            ],
            'info' => [
                'is_liked' => (bool) ($this->liked_by_current_user ?? 0),
                'likes' => (int) ($this->likes_count ?? 0),
                'is_reposted' => (bool) ($this->reposted_by_current_user ?? 0),
                'reposts_count' => (int) ($this->reposts_count ?? 0),
                'comments_count' => (int) ($this->comments_count ?? 0),
                'views' => (int) ($this->views_count ?? 0),
                'is_bookmarked' => (bool) ($this->bookmarked_by_current_user ?? 0),
            ],
            'user' => $this->relationLoaded('user') && $this->user ? [
                'id' => $this->user->id,
                'first_name' => $this->user->first_name,
                'last_name' => $this->user->last_name,
                'username' => $this->user->username,
                'email' => $this->user->email,
                'avatar' => $this->user->avatar,
                'bio' => $this->user->bio,
                ...$this->user->presenceFor($request->user()),
                'joined_at' => $this->user->created_at?->diffForHumans(),
                'followers_count' => (int) ($this->user->followers_count ?? 0),
                'following_count' => (int) ($this->user->followings_count ?? 0),
                'posts_count' => (int) ($this->user->posts_count ?? 0),
                'is_following' => auth()->check() ? $this->user->isFollowing(auth()->user()) : false,
            ] : null,
        ];
    }
}

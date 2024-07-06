import { DotIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import { useFollow } from "@/hooks/useFollow";
import { useState } from "react";
import LoaderCircle from "@/components/LoaderCircle";

export function UserHoverCart({ user, className }) {
  const { loading, handleFollow } = useFollow();
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(user.is_following);

  const bioText =
    user.bio.length > 50 ? user.bio.slice(0, 50) + "..." : user.bio;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className={cn("text-xl font-bold", className)}>
          {user.first_name} {user.last_name}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="mb-2 flex w-full items-center space-x-4">
          <Avatar>
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              {user.first_name[0]}
              {user.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className=" text-lg font-bold">
              {user.first_name} {user.last_name}
            </h4>
            <p className="text-sm text-muted-foreground">{user.username}</p>
          </div>
          {currentUser?.username !== user.username && (
            <button
              className="rounded-full border border-purple-200 px-4 py-1 text-sm font-semibold hover:border-transparent hover:bg-purple-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
              onClick={() => {
                handleFollow(user.id);
                setIsFollowing(!isFollowing);
              }}
            >
              {loading && <LoaderCircle size={15} />}
              {!loading ? (isFollowing ? "Unfollow" : "Follow") : null}
            </button>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm">T{bioText}</p>
          <div className="flex items-center space-x-1">
            <p className="text-sm text-muted-foreground">
              <span className="mr-2 font-black text-secondary-foreground">
                {user.followers_count}
              </span>
              Followers
            </p>
            <DotIcon />
            <p className="text-sm text-muted-foreground">
              <span className="mr-2 font-black text-secondary-foreground">
                {user.following_count}
              </span>
              Following
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

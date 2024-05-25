import { DotIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

export function UserHoverCart({
  first_name,
  last_name,
  bio,
  avatar,
  followers_count,
  following_count,
  is_following,
  username,
  className,
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className={cn("text-xl font-bold", className)}>
          {first_name} {last_name}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="mb-2 flex w-full items-center space-x-4">
          <Avatar>
            <AvatarImage src={avatar} />
            <AvatarFallback>
              {first_name[0]}
              {last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className=" text-lg font-bold">
              {first_name} {last_name}
            </h4>
            <p className="text-sm text-muted-foreground">{username}</p>
          </div>
          <button className="rounded-full border border-purple-200 px-4 py-1 text-sm font-semibold hover:border-transparent hover:bg-purple-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2">
            {is_following ? "Following" : "Follow"}
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-sm">T{bio}</p>
          <div className="flex items-center space-x-1">
            <p className="text-sm text-muted-foreground">
              <span className="mr-2 font-black text-secondary-foreground">
                {followers_count}
              </span>
              Followers
            </p>
            <DotIcon />
            <p className="text-sm text-muted-foreground">
              <span className="mr-2 font-black text-secondary-foreground">
                {following_count}
              </span>
              Following
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

import { CalendarDays, DotIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export function UserHoverCart({
  first_name,
  last_name,
  bio,
  avatar,
  followers_count,
  following_count,
  username,
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link" className="ps-0 text-xl font-bold">
          {first_name} {last_name}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 ">
        <div className="mb-2 flex items-center space-x-2">
          <Avatar className="h-20 w-20">
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

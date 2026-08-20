import { DotIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import LoaderCircle from "@/components/LoaderCircle";
import useAuth from "@/hooks/useAuth";
import { useFollow } from "@/hooks/useFollow";
import { formatLastActive, statusDotClass } from "@/lib/status";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function UserHoverCart({ user, className }) {
  const { user: currentUser } = useAuth();
  const { handleFollow, isPending } = useFollow();
  const [isFollowing, setIsFollowing] = useState(user.is_following ?? false);
  const [pending, setPending] = useState(false);

  const isSelf = currentUser?.id === user.id;
  const bio =
    user.bio && user.bio.length > 90 ? user.bio.slice(0, 90) + "…" : user.bio;
  const dot = statusDotClass(user.status);

  const onFollow = async () => {
    if (isPending) return;
    setPending(true);
    setIsFollowing((prev) => !prev); // optimistic
    try {
      await handleFollow(user.id);
    } catch {
      setIsFollowing((prev) => !prev); // rollback
    } finally {
      setPending(false);
    }
  };

  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 text-xl font-bold hover:underline",
            className,
          )}
        >
          {user.first_name} {user.last_name}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" sideOffset={8}>
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src={user.avatar}
                alt={`${user.first_name} ${user.last_name}`}
                loading="lazy"
              />
              <AvatarFallback>
                {user.first_name?.[0]}
                {user.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            {dot && (
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background",
                  dot,
                )}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold leading-tight">
              {user.first_name} {user.last_name}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              @{user.username}
            </p>
            {dot && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {user.status === "online" ? (
                  <span className="text-green-500">Online</span>
                ) : user.status === "away" ? (
                  <span className="text-yellow-500">Away</span>
                ) : user.status === "dnd" ? (
                  <span className="text-red-500">Do not disturb</span>
                ) : (
                  <span>Last seen {formatLastActive(user.last_active_at) || "recently"}</span>
                )}
              </p>
            )}
          </div>

          {!isSelf && (
            <Button
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              className="shrink-0 rounded-full"
              disabled={pending}
              onClick={onFollow}
            >
              {pending ? (
                <LoaderCircle size={15} />
              ) : isFollowing ? (
                "Unfollow"
              ) : (
                "Follow"
              )}
            </Button>
          )}
        </div>

        {bio && <p className="mt-3 text-sm text-foreground/90">{bio}</p>}

        <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
          <span>
            <span className="mr-1 font-bold text-foreground">
              {user.followers_count ?? 0}
            </span>
            Followers
          </span>
          <DotIcon className="h-4 w-4" />
          <span>
            <span className="mr-1 font-bold text-foreground">
              {user.following_count ?? 0}
            </span>
            Following
          </span>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

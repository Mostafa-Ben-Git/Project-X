import { UserHoverCart } from "@/components/UserHoverCart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import LoaderCircle from "./LoaderCircle";
import useAuth from "@/hooks/useAuth";
import { useFollow } from "@/hooks/useFollow";
import { formatLastActive, statusDotClass } from "@/lib/status";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function UserMiniProfile({ user }) {
  const { user: currentUser } = useAuth();
  const { handleFollow, isPending } = useFollow();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(user.is_following ?? false);
  const [pending, setPending] = useState(false);

  const isSelf = currentUser?.id === user.id;
  const dot = statusDotClass(user.status);

  const goToProfile = () => {
    if (user.username) navigate(`/profile/${user.username}`);
  };

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
    <li className="flex w-full items-center justify-between gap-3 rounded-xl border border-border p-2">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={goToProfile}
          className="relative shrink-0 rounded-full"
          aria-label={`View ${user.first_name} ${user.last_name}'s profile`}
        >
          <Avatar className="h-12 w-12">
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
        </button>
        <div className="flex min-w-0 flex-col">
          <UserHoverCart user={user} className="text-sm font-bold" />
          <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
          {dot && (
            <p className="truncate text-xs text-muted-foreground">
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
      </div>

      {!isSelf && (
        <Button
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          className="shrink-0 rounded-full"
          disabled={pending}
          onClick={onFollow}
        >
          {pending ? <LoaderCircle size={14} /> : isFollowing ? "Unfollow" : "Follow"}
        </Button>
      )}
    </li>
  );
}

export default UserMiniProfile;

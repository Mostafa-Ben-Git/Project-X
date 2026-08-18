import { UserHoverCart } from "@/components/UserHoverCart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFollow } from "@/hooks/useFollow";
import { useState } from "react";
import LoaderCircle from "./LoaderCircle";

function UserMiniProfile({ user }) {
  const { loading, handleFollow } = useFollow();
  const [isFollowing, setIsFollowing] = useState(user.is_following);

  return (
    <li className="flex w-full items-center justify-between gap-3 rounded-xl border border-border p-2">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
          <AvatarFallback>
            {user.first_name?.[0]}
            {user.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <UserHoverCart user={user} className="text-sm font-bold" />
          <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
        </div>
      </div>
      <button
        className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:border-transparent hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        onClick={() => {
          handleFollow(user.id);
          setIsFollowing((prev) => !prev);
        }}
      >
        {loading ? (
          <LoaderCircle size={14} />
        ) : isFollowing ? (
          "Unfollow"
        ) : (
          "Follow"
        )}
      </button>
    </li>
  );
}

export default UserMiniProfile;

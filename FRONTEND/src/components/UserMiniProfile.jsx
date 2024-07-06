import { UserHoverCart } from "@/components/UserHoverCart";
import { useFollow } from "@/hooks/useFollow";
import { useState } from "react";
import LoaderCircle from "./LoaderCircle";

function UserMiniProfile({ user }) {
  const { loading, handleFollow } = useFollow();
  const [User, setUser] = useState(user);

  return (
    <li
      key={user.id}
      className="flex w-full items-center justify-around gap-1 rounded-xl border p-2 shadow-lg"
    >
      <img
        className="block h-12 rounded-full sm:mx-0 sm:shrink-0"
        src={user.avatar}
      />

      <div className="flex flex-col gap-1">
        <UserHoverCart user={user} className={"text-sm font-bold"} />
        <p className="text-muted-foreground">{user.username}</p>
      </div>

      <button
        className="rounded-full border border-purple-200 px-4 py-1 text-sm font-semibold hover:border-transparent hover:bg-purple-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
        onClick={() => {
          handleFollow(user.id);
          setUser({ ...User, is_following: !User.is_following });
        }}
      >
        {loading && <LoaderCircle size={15} />}
        {!loading ? (User.is_following ? "Unfollow" : "Follow") : null}
      </button>
    </li>
  );
}

export default UserMiniProfile;

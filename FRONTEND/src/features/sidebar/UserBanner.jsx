import UserAvatar from "@/components/UserAvatar";
import useAuth from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { LogOut } from "lucide-react";
import { MoonLoader } from "react-spinners";

export const UserBanner = () => {
  const { user, logout, status, isLoggedOut } = useAuth();
  return (
    <div className="m-3 flex flex-col items-center gap-4 rounded-md p-3 hover:bg-slate-500 lg:flex-row">
      <UserAvatar user={user} />
      <div className="flex gap-2">
        <div className="flex flex-col items-center justify-center lg:items-baseline">
          <p className="whitespace-nowrap text-lg font-extrabold">{`${user?.first_name} ${user?.last_name}`}</p>
          <span className="text-sm text-gray-400">{user?.username}</span>
        </div>
      </div>
      <button
        className={`flex items-center justify-center rounded-xl  p-4 ${status === "logout" && "disabled:cursor-not-allowed"} hover:bg-indigo-700`}
        role="button"
        onClick={logout}
        disabled={isLoggedOut}
      >
        {isLoggedOut ? (
          <MoonLoader color="#ffffff" size={20} />
        ) : (
          <LogOut size={20} />
        )}
      </button>
    </div>
  );
};

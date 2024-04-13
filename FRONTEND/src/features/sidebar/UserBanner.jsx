import useAuth from "hooks/useAuth";
import { LogOut } from "lucide-react";
import { MoonLoader } from "react-spinners";

export const UserBanner = () => {
  const { user, logout, status, isLoggedOut } = useAuth();
  return (
    <div className="m-3 flex min-w-max gap-4 rounded-md p-3 hover:bg-slate-500">
      <img
        src={user?.avatar}
        alt=""
        className="h-15 w-15 rounded-full object-cover"
      />
      <div className="flex gap-2">
        <div className="flex flex-col items-baseline justify-center">
          <p className="whitespace-nowrap text-sm font-extrabold">{`${user?.first_name} ${user?.last_name}`}</p>
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

import { Skeleton } from "components/ui/skeleton";
import { useSelector } from "react-redux";
import { NavLink, Navigate, useLocation } from "react-router-dom";
import useAuth from "hooks/useAuth";
import { UserBanner } from "./UserBanner";
import {
  BellIcon,
  Home,
  MessageSquare,
  UserCircle,
  UsersRound,
} from "lucide-react";
export default function LeftBar() {
  const { user, isLoading, status } = useSelector((store) => store.auth);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    return <Navigate to={"/"} />;
  };

  return (
    <aside className="h-screen bg-gray-800 text-white">
      <nav className="flex h-full flex-col border-r shadow-sm">
        <div className="flex items-center justify-between p-4 pb-2">
          <img
            src="https://img.logoipsum.com/223.svg"
            className="overflow-hidden transition-all"
          />
        </div>
        <ul className="mt-3 flex-1 px-3 py-2">
          <SidebarItem icon={<Home size={30} />} to={"/home"} text={"home"} />
          <SidebarItem
            icon={<MessageSquare size={30} />}
            to={"/messages"}
            text={"messages"}
          />
          <SidebarItem
            icon={<BellIcon size={30} />}
            to={"/notifications"}
            text={"notifications"}
          />
          <SidebarItem
            icon={<UsersRound size={30} />}
            to={"/friends"}
            text={"friends"}
          />
          <SidebarItem
            icon={<UserCircle size={30} />}
            to={"/profile"}
            text={"profile"}
          />
        </ul>
        <div className="border-gray-700">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <UserBanner />
          )}
        </div>
      </nav>
    </aside>
  );
}

const LoadingSkeleton = () => (
  <div className="flex items-center space-x-3 px-4">
    <Skeleton className="h-[60px] w-[60px] rounded-xl bg-gray-500" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-[180px] bg-gray-500" />
      <Skeleton className="h-4 w-[140px] bg-gray-500" />
    </div>
  </div>
);

export function SidebarItem({ icon, text, alert, to }) {
  const location = useLocation();

  return (
    <NavLink
      to={to}
      className={
        "my-1 flex cursor-pointer items-center rounded-xl px-3 py-2 font-medium capitalize text-gray-300 hover:bg-gray-700"
      }
    >
      {icon}
      <span className="ml-4 text-xl">{text}</span>
      {alert && <div className="absolute right-2 h-2 w-2 rounded bg-red-400" />}
    </NavLink>
  );
}

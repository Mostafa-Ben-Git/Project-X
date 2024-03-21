import { Skeleton } from "@/components/ui/skeleton";
import { useSelector } from "react-redux";
import { NavLink, Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { UserBanner } from "./UserBanner";
import {
  BellIcon,
  Home,
  MessageSquare,
  UserCircle,
  UsersRound,
} from "lucide-react";
export default function Sidebar() {
  const { user, isLoading, status } = useSelector((store) => store.auth);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    return <Navigate to={"/"} />;
  };

  return (
    <aside className="w-[270px] max-w-xs h-screen fixed left-0 top-0 z-40 border-r">
      <nav className="h-full flex flex-col border-r shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <img
            src="https://img.logoipsum.com/223.svg"
            className="overflow-hidden transition-all"
          />
        </div>
        <ul className="flex-1 px-3 py-2 mt-3">
          <SidebarItem icon={<Home size={24} />} to={"/home"} text={"home"} />
          <SidebarItem
            icon={<MessageSquare size={24} />}
            to={"/messages"}
            text={"messages"}
          />
          <SidebarItem
            icon={<BellIcon size={24} />}
            to={"/notifications"}
            text={"notifications"}
          />
          <SidebarItem
            icon={<UsersRound size={24} />}
            to={"/friends"}
            text={"friends"}
          />
          <SidebarItem
            icon={<UserCircle size={24} />}
            to={"/profile"}
            text={"profile"}
          />
        </ul>
        <div className="border-t border-gray-700 py-4 flex items-center justify-center">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <UserBanner user={user} status={status} onLogout={handleLogout} />
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
  return (
    <NavLink
      to={to}
      className="relative flex items-center py-2 px-3 my-1 font-medium rounded-xl cursor-pointer capitalize active:bg-gray-700 text-gray-300"
    >
      {icon}
      <span className="text-xl ml-4">{text}</span>
      {alert && <div className="absolute right-2 w-2 h-2 rounded bg-red-400" />}
    </NavLink>
  );
}

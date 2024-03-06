import { Skeleton } from "@/components/ui/skeleton";
import { LogOut } from "lucide-react";
import { useSelector } from "react-redux";
import { NavLink, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/auth";

export default function Sidebar({ children }) {
  const { user, isLoading, status } = useSelector((store) => store.auth);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    return <Navigate to={"/"} />;
  };

  return (
    <aside className="h-screen bg-gray-800 text-white">
      <nav className="h-full flex flex-col border-r shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <img
            src="https://img.logoipsum.com/223.svg"
            className="overflow-hidden transition-all"
          />
        </div>
        <ul className="flex-1 px-3 py-2 mt-3">{children}</ul>
        <div className="border-t border-gray-700 py-4 flex items-center justify-center">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <UserInfo user={user} status={status} onLogout={handleLogout} />
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

const UserInfo = ({ user, status, onLogout }) => (
  <div className="flex flex-row items-center justify-between px-2">
    <div className="flex gap-2">
      <img
        src="https://ui-avatars.com/api/?background=3730a3&color=c7d2fe&bold=true"
        alt=""
        className="w-15 h-15 rounded-md"
      />
      <div className="flex flex-col justify-center items-baseline">
        <p className="font-semibold text-lg">{user?.name}</p>
        <span className="text-sm text-gray-400">{user?.email}</span>
      </div>
    </div>
    <LogOut
      size={30}
      className={`m-4 rounded-lg cursor-pointer${status === "logout" && "pointer-events-none"} hover:bg-gray-600`}
      role="button"
      onClick={onLogout}
    />
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

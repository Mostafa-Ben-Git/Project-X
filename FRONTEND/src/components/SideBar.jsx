import { Skeleton } from "@/components/ui/skeleton";
import { LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { NavLink, Navigate } from "react-router-dom";
import { logout } from "../slices/authSlice";

export default function Sidebar({ children }) {
  const { user, isLoading, status } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  return (
    <aside className="h-screen">
      <nav className="h-full flex flex-col bg-white border-r shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <img
            src="https://img.logoipsum.com/212.svg"
            className={`overflow-hidden transition-all`}
            loading="lazy"
            alt=""
          />
        </div>
        <ul className="flex-1 px-3 py-2 mt-3">{children}</ul>

        <div className="border-t py-4 flex items-center justify-center">
          {isLoading ? (
            <div className="flex items-center space-x-3 px-4">
              <Skeleton className="h-[60px] w-[60px] rounded-xl bg-slate-500" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[180px] bg-slate-500" />
                <Skeleton className="h-4 w-[140px] bg-slate-500" />
              </div>
            </div>
          ) : (
            <div className="flex flex-row items-center justify-between px-2">
              <div className="flex gap-2">
                <img
                  src="https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true"
                  alt=""
                  className="w-15 h-15 rounded-md"
                />
                <div className=" flex flex-col justify-center items-baseline">
                  <p className="font-semibold text-lg">{user?.name}</p>
                  <span className="text-sm text-gray-600">{user?.email}</span>
                </div>
              </div>
              <LogOut
                size={30}
                className={`m-4 rounded-lg cursor-pointer ${status === "logout" && "pointer-events-none"} hover: bg-slate-400`}
                role="button"
                onClick={() => {
                  dispatch(logout());
                  return <Navigate to={"/"} />;
                }}
              />
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

export function SidebarItem({ icon, text, alert, to }) {
  return (
    <NavLink
      to={to}
      className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-xl cursor-pointer capitalize active:bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-900

    `}
    >
      {icon}
      <span className={`text-xl ml-4`}>{text}</span>
      {alert && (
        <div className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 `} />
      )}
    </NavLink>
  );
}

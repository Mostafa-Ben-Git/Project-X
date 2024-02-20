import { MoreVertical, MoreVerticalIcon } from "lucide-react";
import { ColorRing } from "react-loader-spinner";
import { useSelector } from "react-redux";

import { NavLink } from "react-router-dom";

export default function Sidebar({ children }) {
  const { user, isLoading } = useSelector((store) => store.auth);
  return (
    <aside className="h-screen w-1/5">
      <nav className="h-full flex flex-col bg-white border-r shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <img
            src="https://img.logoipsum.com/212.svg"
            className={`overflow-hidden transition-all`}
            alt=""
          />
        </div>
        <ul className="flex-1 px-3 py-2 mt-3">{children}</ul>

        <div className="border-t h-1/6 flex items-center justify-center">
          {isLoading ? (
            <ColorRing
              visible={true}
              height="30"
              width="30"
              ariaLabel="color-ring-loading"
              wrapperStyle={{}}
              wrapperClass="color-ring-wrapper"
              colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
            />
          ) : (
            <div className="flex flex-row items-center justify-between w-full px-2">
              <div className="flex gap-2">
                <img
                  src="https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true"
                  alt=""
                  className="w-15 h-15 rounded-md"
                />
                <div className="self-baseline">
                  <h4 className="font-semibold text-xl">{user.name}</h4>
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
              </div>
              <MoreVerticalIcon size={30} className="hover:cursor-pointer" />
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

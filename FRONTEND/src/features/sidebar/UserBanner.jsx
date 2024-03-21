import { LogOut } from "lucide-react";

export const UserBanner = ({ user, status, onLogout }) => (
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

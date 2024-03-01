import {
  BellIcon,
  Home,
  MessageSquare,
  UserCircle,
  UsersRound,
} from "lucide-react";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar, { SidebarItem } from "../components/SideBar";
import { useAuth } from "../hooks/auth";

function UserLayout() {
  const { getUser, user, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!user && isLoggedIn) {
      getUser();
    }
  }, [user, getUser, isLoggedIn]);

  if (!isLoggedIn && !user) return <Navigate to="/login" />;

  return (
    <div className="flex">
      <Sidebar>
        <SidebarItem icon={<Home size={35} />} to={"/home"} text={"home"} />
        <SidebarItem
          icon={<MessageSquare size={35} />}
          to={"/messages"}
          text={"messages"}
        />
        <SidebarItem
          icon={<BellIcon size={35} />}
          to={"/notifications"}
          text={"notifications"}
        />
        <SidebarItem
          icon={<UsersRound size={35} />}
          to={"/friends"}
          text={"friends"}
        />
        <SidebarItem
          icon={<UserCircle size={35} />}
          to={"/profile"}
          text={"profile"}
        />
      </Sidebar>
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}

export default UserLayout;

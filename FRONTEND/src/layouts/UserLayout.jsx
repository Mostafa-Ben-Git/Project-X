import {
  BellIcon,
  Home,
  MessageSquare,
  UserCircle,
  UsersRound,
} from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar, { SidebarItem } from "../components/SideBar";
import { getUser } from "../slices/authSlice";

function UserLayout() {
  const { user, token } = useSelector((store) => store.auth);
  const localToken = localStorage.getItem("token");

  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      dispatch(getUser());
    }
  }, [user, dispatch]);

  if (token != localToken) {
    return <Navigate to="/login" />;
  }

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

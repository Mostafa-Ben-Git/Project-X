import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../features/sidebar/SideBar";
import useAuth from "../hooks/useAuth";

function UserLayout() {
  const { getUser, user, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!user && isLoggedIn) {
      getUser();
    }
  }, [user, getUser, isLoggedIn]);

  if (!isLoggedIn && !user) return <Navigate to="/login" />;

  return (
    <div className="flex bg-gray-800 text-white h-screen ">
      <Sidebar />
      <div className="flex-grow overflow-y-scroll">
        <Outlet />
      </div>
    </div>
  );
}

export default UserLayout;

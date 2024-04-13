import LeftBar from "features/sidebar/LeftBar";
import RightBar from "features/sidebar/RightBar";
import useAuth from "hooks/useAuth";
import usePost from "hooks/usePost";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

function UserLayout() {
  const { getUser, user, isLoggedIn } = useAuth();
  const { pos } = usePost();

  useEffect(() => {
    if (!user && isLoggedIn) {
      getUser();
    }
  }, [user, getUser, isLoggedIn]);


  if (!isLoggedIn && !user) return <Navigate to="/login" />;

  return (
    <div className="flex bg-gray-800 pl-32 text-white">
      <LeftBar />
      <div className="flex-grow-[2] overflow-y-scroll px-8">
        <Outlet />
      </div>
      <RightBar />
    </div>
  );
}

export default UserLayout;

import LeftBar from "features/sidebar/LeftBar";
import RightBar from "features/sidebar/RightBar";
import useAuth from "hooks/useAuth";
import usePost from "hooks/usePost";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

function UserLayout() {
  const { getUser, user, isLoggedIn } = useAuth();
  const { fetchPosts, page } = usePost();

  useEffect(() => {
    if (!user && isLoggedIn) {
      getUser();
    }
  }, [user, getUser, isLoggedIn]);

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  if (!isLoggedIn && !user) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen bg-gray-800 pl-12 text-white 2xl:pl-32">
      <LeftBar className="flex-none" />
      <div className="grow overflow-y-scroll p-8">
        <Outlet />
      </div>
      <RightBar className="  hidden w-1/4 flex-none 2xl:block" />
    </div>
  );
}

export default UserLayout;

import LeftBar from "@/features/sidebar/LeftBar";
import RightBar from "@/features/sidebar/RightBar";
import useAuth from "@/hooks/useAuth";
import usePosts from "@/hooks/usePosts";

import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

function UserLayout() {
  const { getUser, user, isLoggedIn } = useAuth();
  const { fetchPosts } = usePosts();

  useEffect(() => {
    if (!user && isLoggedIn) {
      getUser();
    }
  }, [user, getUser, isLoggedIn]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchPosts();
    return () => abortController.abort();
  }, []);

  if (!isLoggedIn && !user) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen bg-gray-800 pl-12 text-white 2xl:pl-60">
      <LeftBar className="flex-none" />
      <div className="grow overflow-y-scroll">
        <Outlet />
      </div>
      <RightBar className="  hidden w-1/4 flex-none border-l xl:block" />
    </div>
  );
}

export default UserLayout;

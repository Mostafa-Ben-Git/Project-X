import { ScrollArea } from "@/components/ui/scroll-area";
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
    fetchPosts();
  }, []);

  if (!isLoggedIn && !user) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen pl-12 text-white 2xl:pl-40 overflow-hidden">
      <LeftBar className="flex-none" />
      <ScrollArea className="w-full">
        <Outlet />
      </ScrollArea>
      <RightBar className="hidden w-[28%] flex-none border-l lg:block" />
    </div>
  );
}

export default UserLayout;

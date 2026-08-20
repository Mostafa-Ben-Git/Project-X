import { ScrollArea } from "@/components/ui/scroll-area";
import RightBar from "@/features/sidebar/RightBar";
import { Sidebar } from "@/features/sidebar/sidebar";
import useAuth from "@/hooks/useAuth";
import usePosts from "@/hooks/usePosts";
import { useRealtime } from "@/hooks/useRealtime";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { startHeartbeat, stopHeartbeat } from "@/api/apiService";

function UserLayout() {
  const { getUser, user, isLoggedIn } = useAuth();
  const { fetchPosts } = usePosts();
  useRealtime(user?.id);
  useOnlineStatus();

  // Start heartbeat for online status
  useEffect(() => {
    if (user) {
      startHeartbeat();
      return () => stopHeartbeat();
    }
  }, [user]);

  useEffect(() => {
    if (!user && isLoggedIn) {
      getUser();
    }
  }, [user, isLoggedIn, getUser]);

  // Only fetch first page of posts once, not on every render
  useEffect(() => {
    fetchPosts(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoggedIn) return <Navigate to="/login" />;

  return (
    <section className="relative px-4 pb-16 md:pb-0 md:ml-[70px] 2xl:mr-[340px]">
      <Sidebar />
      <ScrollArea className="mt-6">
        <div className="mx-auto w-full max-w-[600px]">
          <Outlet />
        </div>
      </ScrollArea>
      <RightBar />
    </section>
  );
}

export default UserLayout;

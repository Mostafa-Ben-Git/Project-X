import { ScrollArea } from "@/components/ui/scroll-area";
import RightBar from "@/features/sidebar/RightBar";
import { SidebarMobile } from "@/features/sidebar/sidebar-mobile";
import { AppSidebar } from "@/components/app-sidebar";
import { sidebarItems } from "@/features/sidebar/sidebarItems";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";
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
  const { messages, notifications } = useUnreadCounts();
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
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="2xl:mr-[340px]">
        <header className="sticky top-0 z-30 hidden h-12 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur md:flex">
          <SidebarTrigger />
        </header>
        <div className="px-4 pb-16 md:pb-0">
          <ScrollArea className="mt-6">
            <div className="mx-auto w-full max-w-[600px]">
              <Outlet />
            </div>
          </ScrollArea>
        </div>
      </SidebarInset>
      <RightBar />
      <SidebarMobile
        sidebarItems={sidebarItems}
        counts={{ messages, notifications }}
      />
    </SidebarProvider>
  );
}

export default UserLayout;

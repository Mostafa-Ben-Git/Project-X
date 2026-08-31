import { ScrollArea } from "@/components/ui/scroll-area";
import RightBar from "@/features/sidebar/RightBar";
import { SidebarMobile } from "@/features/sidebar/sidebar-mobile";
import { AppSidebar } from "@/components/app-sidebar";
import { sidebarItems } from "@/features/sidebar/sidebarItems";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";
import useAuth from "@/hooks/useAuth";
import usePosts from "@/hooks/usePosts";
import { useRealtime } from "@/hooks/useRealtime";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { startHeartbeat, stopHeartbeat } from "@/api/apiService";

function UserLayout() {
  const { getUser, user, isLoggedIn } = useAuth();
  const { fetchPosts } = usePosts();
  const { messages, notifications } = useUnreadCounts();
  useRealtime(user?.id);
  useOnlineStatus();
  const location = useLocation();
  const isMessages = location.pathname.startsWith("/messages");

  // Start heartbeat for online status
  useEffect(() => {
    if (user) {
      startHeartbeat();
      return () => stopHeartbeat();
    }
  }, [user]);

  // Re-validate session on mount — if DB was re-seeded the stored token
  // is invalid but `user` may still be in Redux from previous session,
  // so we must call getUser even when `user` exists.
  useEffect(() => {
    if (isLoggedIn) {
      getUser();
    }
  }, [isLoggedIn, getUser]);

  // Only fetch first page of posts when we have a valid session
  useEffect(() => {
    if (isLoggedIn) {
      fetchPosts(1);
    }
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoggedIn) return <Navigate to="/login" />;

  return (
    <SidebarProvider defaultOpen={false} className="h-dvh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex h-dvh flex-col overflow-hidden 2xl:mr-[340px]">
        <header className="sticky top-0 z-30 hidden h-12 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/80 px-3 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:flex">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="hidden md:flex" />
            <Logo size={28} wordmarkSize="default" className="md:hidden" />
          </div>
          <span className="hidden text-sm font-medium text-muted-foreground md:inline">Connect. Share. Discover.</span>
        </header>
        {isMessages ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 sm:px-4">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <Outlet />
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-[calc(4rem+env(safe-area-inset-bottom))] sm:px-4 md:px-6 lg:px-8 md:pb-0">
            <ScrollArea className="mt-3 flex-1 overflow-hidden sm:mt-6">
              <div className="mx-auto w-full max-w-full sm:max-w-[600px] md:max-w-[640px] lg:max-w-[680px] xl:max-w-[720px] pb-4">
                <Outlet />
              </div>
            </ScrollArea>
          </div>
        )}
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

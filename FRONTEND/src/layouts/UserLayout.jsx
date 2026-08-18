import { ScrollArea } from "@/components/ui/scroll-area";
import RightBar from "@/features/sidebar/RightBar";
import { Sidebar } from "@/features/sidebar/sidebar";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

function UserLayout() {
  const { getUser, user, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!user && isLoggedIn) {
      getUser();
    }
  }, [user, isLoggedIn, getUser]);

  if (!isLoggedIn) return <Navigate to="/login" />;

  return (
    <section className="relative mx-6 md:ml-[280px] 2xl:mr-[340px]">
      <Sidebar />
      <ScrollArea className="mt-6">
        <Outlet />
      </ScrollArea>
      <RightBar />
    </section>
  );
}

export default UserLayout;

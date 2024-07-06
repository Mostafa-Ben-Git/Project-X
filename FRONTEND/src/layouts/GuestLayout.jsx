import useAuth from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

function GuestLayout() {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return <Navigate to="/home" />;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
}

export default GuestLayout;

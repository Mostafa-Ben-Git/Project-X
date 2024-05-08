import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

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

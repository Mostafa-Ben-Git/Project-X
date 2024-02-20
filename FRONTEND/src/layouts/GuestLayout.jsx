import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function GuestLayout() {
  const token = useSelector((store) => store.auth.token);
  const localToken = localStorage.getItem("token");

  if (localToken == token) {
    return <Navigate to="/home" />;
  }

  return !token && localToken ? (
    <div>Loading...</div>
  ) : (
    <div>
      GuestLayout
      <Outlet />
    </div>
  );
}

export default GuestLayout;

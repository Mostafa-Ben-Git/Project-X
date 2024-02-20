import { Navigate, Outlet } from "react-router-dom";

function GuestLayout() {
  const localToken = localStorage.getItem("token");

  if (localToken) {
    return <Navigate to="/home" />;
  }

  return (
    <div>
      GuestLayout
      <Outlet />
    </div>
  );
}

export default GuestLayout;

import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function GuestLayout() {
  const { token, isLoading } = useSelector((store) => store.auth);

  if (token) {
    return <Navigate to="/home" />;
  }

  return (
    isLoading && (
      <div>
        GuestLayout
        <Outlet />
      </div>
    )
  );
}

export default GuestLayout;

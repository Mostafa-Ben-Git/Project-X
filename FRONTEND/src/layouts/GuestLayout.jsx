import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { setToken } from "../slices/authSlice";

function GuestLayout() {
  const token = useSelector((store) => store.auth.token);
  const localToken = localStorage.getItem("token");
  const dispatch = useDispatch();

  useEffect(() => {
    if (localToken) {
      dispatch(setToken(localToken));
    }
  }, [dispatch, localToken]);

  if (localToken && token) {
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

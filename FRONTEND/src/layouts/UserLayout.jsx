import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../slices/authSlice";

function UserLayout() {
  const { user, token } = useSelector((store) => store.auth);
  const localToken = localStorage.getItem("token");

  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      dispatch(getUser());
    }
  }, [user, dispatch]);

  if (token != localToken) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      UserLayout
      <Outlet />
    </div>
  );
}

export default UserLayout;

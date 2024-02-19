import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../slices/authSlice";

function UserLayout() {
  const { user, token } = useSelector((store) => store.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      dispatch(getUser());
    }
  }, [user, dispatch]);

  if (!token) {
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

import { Outlet } from "react-router-dom";

function DefaultLayout() {
  return (
    <div>
      DefaultLayout
      <Outlet />
    </div>
  );
}

export default DefaultLayout;

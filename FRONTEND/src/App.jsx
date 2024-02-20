import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { setToken } from "./slices/authSlice";

function App() {
  const localToken = localStorage.getItem("token");
  const dispatch = useDispatch();

  useEffect(() => {
    if (localToken) {
      dispatch(setToken(localToken));
    }
  }, [dispatch, localToken]);
  return <RouterProvider router={router} />;
}

export default App;

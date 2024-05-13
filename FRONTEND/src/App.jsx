import { useDispatch } from "react-redux";
import { RouterProvider } from "react-router-dom";
import router from "./app/router";

function App() {
  const localToken = localStorage.getItem("token");
  const dispatch = useDispatch();
  document.body.classList.add("dark");

  return <RouterProvider router={router} />;
}

export default App;

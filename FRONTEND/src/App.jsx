import { RouterProvider } from "react-router-dom";
import router from "./app/router";

function App() {
  document.body.classList.add("dark");

  return <RouterProvider router={router} />;
}

export default App;

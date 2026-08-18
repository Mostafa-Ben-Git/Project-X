import { RouterProvider } from "react-router-dom";
import router from "./app/router";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="project-x-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;

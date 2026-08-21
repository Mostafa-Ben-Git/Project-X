import { RouterProvider } from "react-router-dom";
import router from "./app/router";
import { ThemeProvider } from "@/components/theme-provider";
import ErrorBoundary from "@/components/error-boundary";
import { SmartToaster } from "@/components/smart-toaster";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="project-x-theme">
      <ErrorBoundary>
        <RouterProvider router={router} />
        <SmartToaster />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;

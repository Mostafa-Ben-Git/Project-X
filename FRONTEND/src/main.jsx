import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import App from "./App";
import store from "@/app/store";
import { queryClient } from "@/lib/query-client";
import "sonner/dist/styles.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        richColors
        closeButton
        offset={16}
        gutter={8}
        toastOptions={{
          style: {
            background: "hsl(var(--card))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)",
          },
          classNames: {
            title: "text-sm font-semibold",
            description: "text-sm text-muted-foreground",
            actionButton: "rounded-md bg-primary text-primary-foreground",
          },
        }}
      />
    </QueryClientProvider>
  </Provider>,
);

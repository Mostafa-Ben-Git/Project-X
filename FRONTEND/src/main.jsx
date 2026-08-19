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
      <Toaster position="bottom-center" richColors closeButton />
    </QueryClientProvider>
  </Provider>,
);

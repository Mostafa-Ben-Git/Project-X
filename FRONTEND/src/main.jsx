import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import store from "@/app/store";
import "./index.css";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
    <Toaster
      position="bottom-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: "",
        duration: 3000,
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "hsl(var(--border))",
          borderRadius: "1rem",
        },

        // Default options for specific types
        // success: {
        //   duration: 3000,
        //   theme: {
        //     primary: "green",
        //     secondary: "black",
        //   },
        // },
      }}
    />
  </Provider>,
);

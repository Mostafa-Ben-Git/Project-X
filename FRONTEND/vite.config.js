import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split vendor libs into stable, long-cached chunks
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "react-vendor";
            }
            if (id.includes("redux") || id.includes("@reduxjs")) {
              return "redux-vendor";
            }
            if (id.includes("axios") || id.includes("react-hot-toast") || id.includes("react-spinners") || id.includes("react-loader-spinner")) {
              return "ui-vendor";
            }
            if (id.includes("lucide")) {
              return "icons";
            }
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
});

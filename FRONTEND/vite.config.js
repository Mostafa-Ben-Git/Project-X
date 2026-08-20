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
        // Split vendor libs into stable, long-cached chunks.
        // NOTE: match react *core* packages only — a naive id.includes("react")
        // also catches @tanstack/react-query, react-hot-toast, etc. and creates
        // circular vendor<->react-vendor chunks (TDZ at runtime: "Cannot access
        // 'i' before initialization").
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return "react-vendor";
          }
          if (
            /[\\/]node_modules[\\/](redux|@reduxjs)[\\/]/.test(id)
          ) {
            return "redux-vendor";
          }
          if (
            /[\\/]node_modules[\\/](axios|react-hot-toast|react-spinners|react-loader-spinner)[\\/]/.test(
              id
            )
          ) {
            return "ui-vendor";
          }
          if (/[\\/]node_modules[\\/]lucide-react[\\/]/.test(id)) {
            return "icons";
          }
          return "vendor";
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
});

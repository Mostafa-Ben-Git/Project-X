import path from "path";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), eslint({ failOnWarning: false })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:8000",
      "/broadcasting": "http://localhost:8000",
      "/sanctum": "http://localhost:8000",
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../BACKEND/public"),
    emptyOutDir: false,
    rollupOptions: {
      output: {
        // Keep all node_modules in a single vendor chunk on purpose.
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
});

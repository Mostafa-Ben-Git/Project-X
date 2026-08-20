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
        // Keep all node_modules in a single vendor chunk on purpose.
        // Splitting react / redux / axios / lucide into separate chunks creates
        // circular vendor<->react-vendor references; when a lazy route chunk
        // (e.g. ProfilePage) loads, a binding in react-vendor is accessed before
        // that chunk finishes initializing -> runtime TDZ ("Cannot access 'i'
        // before initialization"). A single vendor chunk removes the cross-chunk
        // cycle (Rollup orders intra-chunk deps correctly).
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

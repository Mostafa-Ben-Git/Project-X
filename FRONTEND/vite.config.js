/* eslint-disable no-undef */
import eslint from "vite-plugin-eslint";
import path from "path";
import react from "@vitejs/plugin-react";

import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), eslint()],
  resolve: {
    alias: {
      components: path.resolve("src/components/"),
      pages: path.resolve("src/pages/"),
      lib: path.resolve("src/lib/"),
      hooks: path.resolve("src/hooks/"),
      images: path.resolve("src/images/"),
      features: path.resolve("src/features/"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

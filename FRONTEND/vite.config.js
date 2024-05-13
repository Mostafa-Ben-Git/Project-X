/* eslint-disable no-undef */
import path from "path";
import eslin from "vite-plugin-eslint";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(),eslin({ failOnWarning: false, failOnError: true })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

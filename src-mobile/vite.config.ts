import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import react from "@vitejs/plugin-react";
import { internalIpV4 } from "internal-ip";

import * as path from "path";

const mobile =
  process.env.TAURI_PLATFORM === "android" ||
  process.env.TAURI_PLATFORM === "ios";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/"),
      components: `${path.resolve(__dirname, "./src/components/")}`,
      public: `${path.resolve(__dirname, "./public/")}`,
      views: path.resolve(__dirname, "./src/views"),
      lib: path.resolve(__dirname, "./src/lib"),
      layouts: path.resolve(__dirname, "./src/layouts"),
      assets: path.resolve(__dirname, "./src/assets"),
      shared: path.resolve(__dirname, "./src/shared"),
      routes: path.resolve(__dirname, "./src/routes"),
      theme: path.resolve(__dirname, "./src/theme"),
      types: `${path.resolve(__dirname, "./src/types")}`,
      services: `${path.resolve(__dirname, "./src/services")}`,
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // Tauri expects a fixed port, fail if that port is not available
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: {
      protocol: "ws",
      host: await internalIpV4(),
      port: 5174,
    },
    strictPort: true,
  },
  // To make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
    // Don't minify for debug builds
    minify: process.env.TAURI_DEBUG ? false : "esbuild",
    // Produce sourcemaps for debug builds
    sourcemap: Boolean(process.env.TAURI_DEBUG),
  },
});

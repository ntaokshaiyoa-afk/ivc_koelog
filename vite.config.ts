// vite.config.ts

import { defineConfig } from "vite";

export default defineConfig({
  base: "./", // GitHub Pages対応

  build: {
    target: "esnext", // WASM & Worker用（重要）
  },

  worker: {
    format: "es" // ← ★これが超重要（module worker用）
  }
});

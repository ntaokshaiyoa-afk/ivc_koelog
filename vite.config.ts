import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })),
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },

  worker: {
    format: "es"
  },

  build: {
    target: "esnext"
  }
});

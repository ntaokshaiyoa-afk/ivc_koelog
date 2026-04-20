import { defineConfig } from "vite";
import { execSync } from 'node:child_process'
const commitHash = execSync('git rev-parse --short HEAD').toString().trim()

export default defineConfig({
  base: "/ivc_koelog/",
  
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })),
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },

  worker: {
    format: "es"
  },

  build: {
    target: "esnext"
  }
});

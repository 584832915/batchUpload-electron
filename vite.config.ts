import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  server: {
    host: "localhost",
    port: 9080,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [vue()]
})

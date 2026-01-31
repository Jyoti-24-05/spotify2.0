import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from 'node:url'
// import path from "path";

export default defineConfig({
 plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // "@": path.resolve(__dirname, "./src"),
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server:{
    port:3000,
  },
});

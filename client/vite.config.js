import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/user": "https://rudra-app-backend.onrender.com/api",
    },
  },
  plugins: [react()],
});

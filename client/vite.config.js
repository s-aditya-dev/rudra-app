import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {backEndPort} from '../api/settings.js'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/user": `${backEndPort}/api`,
    },
  },
  plugins: [react()],
});

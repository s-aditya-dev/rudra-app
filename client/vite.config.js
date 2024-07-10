import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {backEndPort} from '../config.js'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/user": `${backEndPort}/api`,
    },
  },
  plugins: [react()],
});

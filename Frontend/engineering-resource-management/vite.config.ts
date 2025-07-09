// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// Import these two new helpers from Node.js modules
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      // This is the modern ESM way to get the path to the 'src' directory
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
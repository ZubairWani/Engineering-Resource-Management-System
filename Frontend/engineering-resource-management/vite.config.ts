import { defineConfig } from 'vite'
import path from "path"                         // <-- Add this for path resolution
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'   // <-- Add this plugin import

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths() // <-- Add this plugin to the array
  ],
  // This section explicitly tells Vite how to resolve the '@' alias
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
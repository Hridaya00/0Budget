import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Build output goes to "dist" (Vite's default) - this is what Cloudflare Pages will publish.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})

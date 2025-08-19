import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  plugins: [react()],
  define: {
    // Fix the process.env issue
    'process.env': {}
  }
})
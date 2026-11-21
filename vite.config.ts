import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { legalPages } from './legal/plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), legalPages()],
})

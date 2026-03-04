import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'strip-gh-redirect',
      transformIndexHtml(html) {
        // Remove GH Pages redirect script during build (only needed in source for root index.html)
        return html.replace(/<script>\s*if\s*\(location\.hostname[\s\S]*?<\/script>\s*/, '');
      },
    },
  ],
  base: '/web-tools/return-bep-simulator-v6/dist/',
})

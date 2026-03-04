import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'strip-gh-redirect',
      transformIndexHtml(html) {
        return html.replace(/<script>\s*if\s*\(location\.hostname[\s\S]*?<\/script>\s*/, '');
      },
    },
  ],
  base: command === 'build' ? '/web-tools/return-bep-simulator-v6/dist/' : '/web-tools/return-bep-simulator-v6/',
}))

import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      // Dev: / 요청 시 app.html 서빙 (index.html 대신)
      name: 'dev-entry',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const base = '/web-tools/return-bep-simulator-v6/';
          if (req.url === base || req.url === base + 'index.html') {
            req.url = base + 'app.html';
          }
          next();
        });
      },
    },
  ],
  base: '/web-tools/return-bep-simulator-v6/',
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'app.html'),
    },
  },
})

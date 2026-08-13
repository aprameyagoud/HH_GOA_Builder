import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createShareMiddleware } from './server/middleware.js'

const sharePlugin = () => ({
  name: 'hh-share-plugin',
  configureServer(server) {
    server.middlewares.use(createShareMiddleware());
  },
  configurePreviewServer(server) {
    server.middlewares.use(createShareMiddleware());
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sharePlugin()],
})


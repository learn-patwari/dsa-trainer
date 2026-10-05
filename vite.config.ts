import { defineConfig, loadEnv, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Read API_PORT from .env too, so the proxy always matches the API server.
  const env = loadEnv(mode, process.cwd(), '');
  const apiPort = Number(env.API_PORT || 5179);

  return {
    root: 'web',
    plugins: [react()],
    server: {
      port: 5178,
      strictPort: true,
      // The API listens on 127.0.0.1 only; name it explicitly (localhost may resolve to ::1 first).
      proxy: {
        '/api': `http://127.0.0.1:${apiPort}`,
        // The drawing canvas's fonts are served by the API server from node_modules.
        '/excalidraw': `http://127.0.0.1:${apiPort}`,
      },
    },
    // The canvas is a lazy import, so without this Vite finds Excalidraw only when the window
    // first opens, re-bundles mid-session and serves the old copy as a 504.
    optimizeDeps: { include: ['@excalidraw/excalidraw'] },
    build: {
      outDir: '../dist/web',
      emptyOutDir: true,
    },
    test: {
      root: '.',
      include: ['tests/**/*.test.ts'],
    },
  } as UserConfig & { test: unknown };
});

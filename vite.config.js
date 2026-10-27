import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carregar variables .env per poder-les usar al proxy
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    server: {
      port: 3000,
      open: false,

      proxy: {
        // ── Proxy per obtenir token de Spotify ──────────────────────────────
        // El navegador crida GET /spotify-token → Vite ho reenvia a Spotify
        // sense CORS perquè és servidor a servidor (Node → Spotify).
        '/spotify-token': {
          target: 'https://accounts.spotify.com',
          changeOrigin: true,
          rewrite: () => '/api/token',

          // Injectem les credencials aquí al servidor de dev
          // → el client_secret NO es filtra mai al navegador
          configure(proxy) {
            proxy.on('proxyReq', (proxyReq) => {
              const clientId = env.VITE_SPOTIFY_CLIENT_ID || '';
              const clientSecret = env.VITE_SPOTIFY_CLIENT_SECRET || '';
              const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

              proxyReq.setHeader('Authorization', `Basic ${creds}`);
              proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');

              const body = 'grant_type=client_credentials';
              proxyReq.setHeader('Content-Length', Buffer.byteLength(body));
              proxyReq.write(body);
              proxyReq.end();
            });
          },
        },

        // ── Proxy per a totes les crides a l'API de Spotify ─────────────────
        // El navegador crida /spotify-api/v1/... → Vite ho reenvia a api.spotify.com
        '/spotify-api': {
          target: 'https://api.spotify.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/spotify-api/, ''),
        },
      },
    },
  };
});

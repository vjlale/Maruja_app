// Configuración de PM2 para mantener la app Maruja siempre corriendo en el VPS.
// Uso:  pm2 start ecosystem.config.js
//       pm2 save && pm2 startup   (para que arranque sola al reiniciar el server)
module.exports = {
  apps: [
    {
      name: 'maruja',
      script: 'npm',
      args: 'start',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        // Puerto 3001 por defecto para evitar conflictos con otras apps en el VPS.
        // Cambialo si ese puerto también está ocupado.
        PORT: 3001,
        // Nota: el QR se autodetecta desde el navegador (ver lib/vote-url.ts),
        // así que NO hace falta definir NEXT_PUBLIC_VOTE_URL acá. Esa variable
        // es de build-time (no de runtime): definirla en PM2 no tiene efecto en
        // el cliente y además provocaría un hydration mismatch. Si querés forzar
        // una URL fija, definila ANTES de compilar:
        //   NEXT_PUBLIC_VOTE_URL=http://TU_IP:3000/vote npm run build
      },
      autorestart: true,
      max_restarts: 10,
      watch: false,
    },
  ],
};

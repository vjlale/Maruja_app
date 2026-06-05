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
        PORT: 3000,
        // Cambiá esta IP por la IP pública de tu VPS (o tu dominio si tenés).
        // OJO: esta variable se "hornea" en el build, así que si la cambiás
        // tenés que volver a correr `npm run build`.
        NEXT_PUBLIC_VOTE_URL: 'http://TU_IP_PUBLICA:3000/vote',
      },
      autorestart: true,
      max_restarts: 10,
      watch: false,
    },
  ],
};

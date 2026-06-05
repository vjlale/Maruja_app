# Guía de Deploy — App Maruja en un VPS

Esta guía deja la app corriendo **siempre prendida** en un VPS, accesible desde
cualquier celular por internet, **sin necesidad de dominio** (usando la IP pública).

> La app detecta automáticamente la dirección desde donde se accede, así que el
> código QR va a apuntar solo a la IP/dominio correcto. **No tenés que configurar
> nada de URLs** en el caso más simple.

---

## 1. Requisitos del VPS

- Un VPS con **Ubuntu 22.04 o 24.04** (sirve cualquier proveedor: Hetzner, DigitalOcean, Contabo, Vultr, etc.).
- Acceso por SSH (`ssh root@TU_IP_PUBLICA`).
- Con el plan más barato (1 vCPU / 1 GB RAM) alcanza de sobra para una fiesta.

---

## 2. Instalar Node.js y herramientas

Conectate por SSH y ejecutá:

```bash
# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Instalar PM2 (mantiene la app prendida y la reinicia si se cae)
sudo npm install -g pm2

# Verificar
node -v && npm -v
```

---

## 3. Clonar y preparar la app

```bash
git clone https://github.com/vjlale/Maruja_app.git
cd Maruja_app

# Instalar dependencias
npm install

# Construir la versión de producción
npm run build
```

---

## 4. Arrancar la app con PM2

```bash
# Arrancar usando la configuración declarativa del repo
# (define nombre "maruja", puerto 3000 y reinicio automático)
pm2 start ecosystem.config.js

# Que arranque sola cuando se reinicia el VPS
pm2 save
pm2 startup    # copiá y ejecutá el comando que te muestra
```

Comandos útiles de PM2:

```bash
pm2 logs maruja     # ver los logs en vivo
pm2 restart maruja  # reiniciar
pm2 stop maruja     # detener
pm2 status          # estado general
```

---

## 5. Abrir el puerto en el firewall

```bash
sudo ufw allow 3000/tcp
sudo ufw allow OpenSSH
sudo ufw enable
```

(Si tu proveedor tiene un firewall propio en su panel web, abrí también ahí el puerto **3000**.)

---

## 6. ¡Listo! Acceder a la app

Reemplazá `TU_IP_PUBLICA` por la IP de tu VPS:

| Vista | URL |
|---|---|
| **Votantes** (lo que escanea la gente) | `http://TU_IP_PUBLICA:3000/vote` |
| **Panel del DJ** | `http://TU_IP_PUBLICA:3000/admin` |
| **Display para OBS** | `http://TU_IP_PUBLICA:3000/display` |

El código QR que aparece en el panel y en el display ya va a apuntar solo a
`http://TU_IP_PUBLICA:3000/vote`. 🎉

---

## 7. (Opcional) Que se vea más lindo: puerto 80 sin `:3000`

Si querés que la URL sea `http://TU_IP_PUBLICA/vote` (sin el `:3000`),
instalá Nginx como proxy:

```bash
sudo apt-get install -y nginx
sudo tee /etc/nginx/sites-available/maruja > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/maruja /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
sudo ufw allow 80/tcp
```

> El bloque `Upgrade`/`Connection` es **clave** para que funcionen los WebSockets
> (la sincronización en tiempo real).

Ahora las URLs son sin puerto: `http://TU_IP_PUBLICA/vote`, `/admin`, `/display`.

---

## 8. (Opcional) Con dominio + HTTPS

Si más adelante conseguís un dominio (ej. `maruja.fiesta`):

1. Apuntá el dominio (registro A) a la IP del VPS.
2. Reemplazá `server_name _;` por `server_name tudominio.com;` en la config de Nginx.
3. Instalá un certificado gratis con Certbot:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com
```

Listo: `https://tudominio.com/vote`.

---

## 9. Actualizar la app cuando haya cambios

```bash
cd Maruja_app
git pull
npm install
npm run build
pm2 restart maruja
```

---

## Notas

- **No hace falta dominio ni HTTPS** para una fiesta: la app no usa cámara ni datos
  sensibles, así que HTTP por IP funciona perfecto desde cualquier celular.
- Si querés forzar una URL específica en el QR (por ejemplo un dominio aunque
  accedas por IP), copiá `.env.example` a `.env`, definí `NEXT_PUBLIC_VOTE_URL`
  y volvé a correr `npm run build`.
- Los votos viven en memoria: si reiniciás la app, la votación se reinicia. Esto
  es a propósito (cada fiesta es una sesión nueva).

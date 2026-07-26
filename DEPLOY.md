# Despliegue — proyecto-ganado

Todo corre en la **misma instancia de Lightsail** que trading, con **pm2** y acceso por
**Tailscale**. Dos procesos: el backend (API) y el front (estático).

- Backend `ganado-api` → puerto **3090** (trading usa 3080/3081).
- Front `ganado-web` → puerto **8091** (estático con `serve.cjs`). OJO: el **8090 ya lo usa el
  dashboard de trading**, no reutilizarlo.
- Mongo: **mismo cluster Atlas de trading**, base de datos **`ganaderia`**, colección **`ganado`**
  (Mongoose las crea solas en la primera escritura).

## 1. Código al box (git, como trading)
```bash
# En el box, como el usuario que maneja los apps:
cd /home/bot/apps
git clone <REMOTO> proyecto-ganado      # o: cd proyecto-ganado && git pull
```

## 2. Backend
```bash
cd /home/bot/apps/proyecto-ganado/server
npm install
cp env-example .env
# editar .env:
#   DB_URI  = la URI de Atlas de trading, cambiando la base al final -> .../ganaderia
#   API_KEY = $(openssl rand -hex 32)
#   PORT=3090, CORS_ORIGIN=*
#   (fotos opcional) S3_ANIMAL_BUCKET / AWS_REGION / credenciales AWS
node -e "require('dotenv').config();require('./config/env').validateEnv();console.log('env ok')"  # valida .env
sudo pm2 start index.js --name ganado-api
sudo pm2 save
curl -s localhost:3090/health           # -> {"status":"healthy",...}
```

## 3. Front (estático con pm2)
El `VITE_API_URL` se hornea en el build, así que se define ANTES de compilar. La API key NO
va en el build: se pega en el gate al abrir la web (se guarda en el navegador).
```bash
cd /home/bot/apps/proyecto-ganado
npm install
echo 'VITE_API_URL=http://<host-tailscale>:3090/api' > .env   # el hostname del box en el tailnet
npm run build                            # genera dist/
PORT=8091 pm2 start serve.cjs --name ganado-web   # 8091: el 8090 es del dashboard de trading
sudo pm2 save
```
Abrir `http://<IP-o-host>:8091` desde un dispositivo en el tailnet → pega la misma `API_KEY`.

## 4. Actualizar (releases futuros)
```bash
cd /home/bot/apps/proyecto-ganado && git pull
cd server && npm install && sudo pm2 restart ganado-api
cd ..    && npm install && npm run build && pm2 restart ganado-web
```

## Notas
- **Atlas**: verificar que el usuario de la conexión tenga `readWrite` sobre la base `ganaderia`
  (si está limitado solo a `test`, otorgar acceso a `ganaderia`). El allowlist de IP ya cubre el box.
- **Puertos 3090/8091**: abrir en el firewall de Lightsail para acceso por IP pública (la API queda protegida por `x-api-key`). El 8090 es del dashboard de trading — no tocarlo.
- **Fotos**: sin `S3_ANIMAL_BUCKET` la app funciona igual; el endpoint de foto devuelve `fotoUrl:null`
  y la UI muestra "no disponible". Para activarlas: bucket con lectura pública en `animals/*` + credenciales con `s3:PutObject`.
- **Modo local**: sin `VITE_API_URL` el front corre 100% en localStorage (sin gate) — útil para demo/offline.

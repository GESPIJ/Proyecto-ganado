require('dotenv').config();
require('module-alias/register');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('@db');
const { connectDatabase } = require('@db');
const { validateEnv } = require('@config/env');
const { requireApiKey } = require('@middleware/auth');
const logger = require('@modules/logger');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

app.get('/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const healthy = mongoState === 1;
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: { mongo: { status: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoState] || 'unknown', connected: healthy } },
  });
});

app.use('/api', requireApiKey);
app.use('/api/animals', require('@routes/animals'));

// Manejo de errores de multer (p. ej. archivo muy grande o formato no soportado).
app.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message || 'Error procesando la petición' });
  next();
});

let server;
async function start() {
  const config = validateEnv();
  await connectDatabase(config.DB_URI);

  server = await new Promise((resolve) => {
    const listener = app.listen(config.PORT, () => resolve(listener));
  });
  logger.info(`Servidor de ganado corriendo en el puerto ${config.PORT}`);
  return server;
}

async function shutdown(signal) {
  logger.info(`Recibido ${signal}; cerrando.`);
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
}

if (require.main === module) {
  process.on('unhandledRejection', (reason) => {
    logger.error('Promesa rechazada sin manejar (proceso sigue vivo):', reason);
  });

  start().catch((error) => {
    logger.error('La aplicación no pudo arrancar:', error);
    process.exitCode = 1;
  });
  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.once(signal, () => shutdown(signal).finally(() => process.exit(0)));
  }
}

module.exports = { app, start, shutdown };

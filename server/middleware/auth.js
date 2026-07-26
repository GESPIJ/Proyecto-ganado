/**
 * Autenticación por API key. Toda ruta /api exige el header `x-api-key` igual a
 * process.env.API_KEY. Fail-closed: si API_KEY no está configurada, se rechaza
 * todo para no exponer el servidor sin auth por accidente.
 */
const crypto = require('crypto');

function requireApiKey(req, res, next) {
  const configuredKey = process.env.API_KEY;

  if (!configuredKey) {
    console.error('[auth] API_KEY no está seteada — se rechaza la petición. Setea API_KEY en .env.');
    return res.status(503).json({ error: 'Server auth not configured' });
  }

  const providedKey = req.headers['x-api-key'];
  if (!providedKey || typeof providedKey !== 'string') {
    return res.status(401).json({ error: 'Missing x-api-key header' });
  }

  // Comparación en tiempo constante para evitar timing attacks.
  const provided = Buffer.from(providedKey);
  const expected = Buffer.from(configuredKey);
  const isValid = provided.length === expected.length && crypto.timingSafeEqual(provided, expected);

  if (!isValid) {
    console.warn(`[auth] API key inválida desde ${req.ip} en ${req.method} ${req.originalUrl}`);
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
}

module.exports = { requireApiKey };

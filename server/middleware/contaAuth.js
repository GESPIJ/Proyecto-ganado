/**
 * Candado del módulo de Contabilidad. Además de la API key general (requireApiKey),
 * las rutas de /api/movimientos exigen usuario + contraseña propios, vía headers
 * `x-conta-user` / `x-conta-key`, comparados con CONTA_USER / CONTA_KEY del entorno.
 * Fail-closed: si no están configurados, se rechaza todo.
 */
const crypto = require('crypto');

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

function requireContaAuth(req, res, next) {
  const user = process.env.CONTA_USER;
  const key = process.env.CONTA_KEY;

  if (!user || !key) {
    console.error('[contaAuth] CONTA_USER/CONTA_KEY no configurados — se rechaza el acceso a contabilidad.');
    return res.status(503).json({ error: 'Contabilidad no configurada' });
  }

  const provUser = req.headers['x-conta-user'];
  const provKey = req.headers['x-conta-key'];
  if (!provUser || !provKey) {
    return res.status(401).json({ error: 'Faltan credenciales de contabilidad' });
  }

  if (!safeEqual(provUser, user) || !safeEqual(provKey, key)) {
    console.warn(`[contaAuth] Credenciales de contabilidad inválidas desde ${req.ip}`);
    return res.status(401).json({ error: 'Usuario o contraseña de contabilidad incorrectos' });
  }

  next();
}

module.exports = { requireContaAuth };

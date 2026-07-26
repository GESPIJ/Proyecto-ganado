// Servidor estático mínimo para el SPA (sin dependencias). Sirve ./dist con
// fallback a index.html para rutas del cliente. Reemplaza a `pm2 serve`, que
// deja procesos huérfanos pegados al puerto al reiniciar (EADDRINUSE).
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 8090;
const ROOT = path.join(__dirname, 'dist');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

function send(res, status, body, type) {
  res.writeHead(status, { 'Content-Type': type || 'text/plain; charset=utf-8' });
  res.end(body);
}

function serveIndex(res) {
  fs.readFile(path.join(ROOT, 'index.html'), (err, html) => {
    if (err) return send(res, 404, 'Not found');
    send(res, 200, html, TYPES['.html']);
  });
}

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    let rel = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
    if (rel === '/' || rel === '') return serveIndex(res);

    const filePath = path.join(ROOT, rel);
    if (!filePath.startsWith(ROOT)) return send(res, 403, 'Forbidden');

    fs.readFile(filePath, (err, data) => {
      if (err) return serveIndex(res); // fallback SPA
      const ext = path.extname(filePath).toLowerCase();
      send(res, 200, data, TYPES[ext] || 'application/octet-stream');
    });
  } catch {
    send(res, 500, 'Server error');
  }
});

server.listen(PORT, () => console.log(`ganado-web sirviendo dist/ en :${PORT}`));

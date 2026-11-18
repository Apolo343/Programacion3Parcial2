
const http = require('http');
const fs = require('fs');
const path = require('path');

const PUERTO = process.env.PORT || 5500;
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

http
  .createServer((req, res) => {
    const ruta = decodeURIComponent(req.url.split('?')[0]);
    const archivo = path.normalize(path.join(__dirname, ruta === '/' ? 'index.html' : ruta));
    if (!archivo.startsWith(__dirname)) {
      res.writeHead(403);
      return res.end('Prohibido');
    }
    fs.readFile(archivo, (error, contenido) => {
      if (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('404 - No encontrado');
      }
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream' });
      res.end(contenido);
    });
  })
  .listen(PUERTO, () => console.log(`Frontend en http://localhost:${PUERTO}`));

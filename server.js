/* Servidor local opcional — no Vercel os arquivos estáticos são servidos diretamente. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const files = { '/': 'index.html', '/index.html': 'index.html', '/style.css': 'style.css', '/app.js': 'app.js' };
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8' };
http.createServer((req, res) => {
  const file = files[new URL(req.url, 'http://localhost').pathname];
  if (!file) { res.writeHead(404); return res.end('Não encontrado.'); }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)], 'Cache-Control': 'no-store' });
  res.end(fs.readFileSync(path.join(__dirname, file)));
}).listen(process.env.PORT || 3000, () => console.log('Amigo oculto disponível em http://localhost:3000'));

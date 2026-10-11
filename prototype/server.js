// Minimal static server for the prototype (dev only).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8471);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.wasm': 'application/wasm',
  '.ps': 'text/plain; charset=utf-8',
  '.icc': 'application/octet-stream',
  '.pdf': 'application/pdf',
  '.json': 'application/json',
  '.css': 'text/css; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (urlPath === '/') urlPath = '/index.html';
    const file = path.normalize(path.join(root, urlPath));
    if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
    if (req.method === 'POST' && urlPath === '/__save') {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = Buffer.concat(chunks);
      const name = new URL(req.url, 'http://x').searchParams.get('name') || 'browser-saved.pdf';
      const dest = path.join(root, 'test', 'out', path.basename(name));
      const { writeFile } = await import('node:fs/promises');
      await writeFile(dest, body);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('saved ' + name + ' (' + body.length + ' bytes)');
      return;
    }
    const data = await readFile(file);
    res.writeHead(200, {
      'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': data.length,
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`prototype server on http://127.0.0.1:${port}/`);
});

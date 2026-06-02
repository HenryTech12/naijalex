import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const rootDir = resolve(process.cwd(), 'dist');
const port = Number(process.env.PORT || 4173);

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

function contentTypeFor(filePath) {
  return contentTypes.get(extname(filePath)) || 'application/octet-stream';
}

async function sendFile(response, filePath) {
  const body = await readFile(filePath);
  response.writeHead(200, {
    'Content-Type': contentTypeFor(filePath),
    'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  response.end(body);
}

createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || '/', 'http://localhost');
    const pathname = decodeURIComponent(requestUrl.pathname);
    const normalizedPath = pathname === '/' ? '/index.html' : pathname;
    const filePath = join(rootDir, normalizedPath);

    if (!filePath.startsWith(rootDir)) {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Bad request');
      return;
    }

    try {
      await sendFile(response, filePath);
    } catch {
      await sendFile(response, join(rootDir, 'index.html'));
    }
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(error instanceof Error ? error.message : 'Internal server error');
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`Static server listening on http://0.0.0.0:${port}`);
});
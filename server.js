const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8080;
const root = process.cwd();

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function serveFile(filePath, response) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    const type = mimeTypes[ext] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': type });
    response.end(data);
  });
}

const server = http.createServer((req, res) => {
  let filePath = path.join(root, req.url);
  if (req.url === '/' || req.url === '') {
    filePath = path.join(root, 'index.html');
  }
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // fallback for single-page apps
      serveFile(path.join(root, 'index.html'), res);
    } else {
      serveFile(filePath, res);
    }
  });
});

server.listen(port, () => {
  console.log(`Serving on http://localhost:${port}`);
});

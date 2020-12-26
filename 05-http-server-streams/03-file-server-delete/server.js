const url = require('url');
const http = require('http');
const path = require('path');

const server = new http.Server();
const {unlink} = require('fs');

server.on('request', (req, res) => {

  // Вложенные папки не поддерживаются, при запросе вида `/dir1/dir2/filename` - ошибка `400`
  const pathParts = req.url.split('/');
  if (pathParts.length > 2) {
    res.statusCode = 400;
    return res.end('Wrong path');
  }

  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':

      unlink(filepath, (err) => {
        if (err && err.code === 'ENOENT') {
          res.statusCode = 404;
          res.end('File Not found');
          return;
        }
        if ( err ) {
          res.statusCode = 500;
          res.end('Error');
          return;
        }
        res.statusCode = 200;
        res.end('File deleted');
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;

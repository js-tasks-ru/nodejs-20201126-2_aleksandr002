const url = require('url');
const http = require('http');
const path = require('path');
const { createReadStream } = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {

  const pathParts = req.url.split('/');

  if (pathParts.length > 2) {
    res.statusCode = 400;
    return res.end('Wrong path');  
  }

  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':

      const readStream = createReadStream(filepath);
      readStream.pipe(res);

      readStream.on('error', error => {
        if (error.code === 'ENOENT'){
          res.statusCode = 404;
          return res.end('Not found');  
        }
        res.statusCode = 500;
        return res.end('Error');  
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;

const url = require('url');
const http = require('http');
const path = require('path');
const { createWriteStream, unlink } = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

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
    case 'POST':

      const limitSizeStream = new LimitSizeStream({limit: 1024*1024});
      const writeStream = createWriteStream(filepath, {flags: 'wx'});

      req
      .pipe(limitSizeStream)
      .pipe(writeStream);

      req.on('error', () => {
        // Если в процессе загрузки файла на сервер произошел обрыв соединения — созданный файл с диска надо удалять
        writeStream.destroy();
        unlink(filepath, () => {});
      })

      limitSizeStream.on( 'error', error => {
        // При попытке создания слишком большого файла
        writeStream.destroy();
        unlink(filepath, () => {
          res.statusCode = 413;
          res.end(error.code);  
        });
      });
      
      writeStream.on('finish', () => {
        res.statusCode = 200;
        return res.end('Success');
      });

      writeStream.on('error', error => {
        // Если файл уже есть на диске - сервер должен вернуть ошибку `409`
        if (error.code === 'EEXIST'){
          res.statusCode = 409;
          return res.end('File already exists');  
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

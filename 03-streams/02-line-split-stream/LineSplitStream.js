const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {

  #complete = '';

  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    this.#complete += chunk;
    callback();
  }

  _flush(callback) {
    const parts = this.#complete.split(`${os.EOL}`);
    parts.forEach(part => {
      this.push(part);
    });
    callback();
  }
}

module.exports = LineSplitStream;

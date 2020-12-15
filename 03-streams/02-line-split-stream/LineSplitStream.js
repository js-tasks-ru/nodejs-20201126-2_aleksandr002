const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {

  #rest = '';

  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    this.#rest += chunk;
    const parts = this.#rest.split(`${os.EOL}`);

    // есть символы переноса - можно передать образовавшиеся строки, кроме последней
    // последняя может быть началом следующей строки
    if (parts.length > 1) {
      let i = 0
      while( i < parts.length - 1) {
        this.push(parts[i]);  
        i++;
      }
      this.#rest = parts[parts.length-1];
    }
    callback();
  }

  _flush(callback) {
    if (this.#rest.length > 0){
      this.push(this.#rest);
      callback();  
    }
  }
}

module.exports = LineSplitStream;

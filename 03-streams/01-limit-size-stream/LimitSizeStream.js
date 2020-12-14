const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  #limit = 0;
  #streamSize = 0;
  
  constructor(options) {
    super(options);
    this.#limit = options.limit;
  }

  _transform(chunk, encoding, callback) {
    this.#streamSize += chunk.length;
    if ( this.#streamSize > this.#limit ) {
      return this.destroy(new LimitExceededError());
    }
    this.push(chunk);
    callback();
  }
}

module.exports = LimitSizeStream;

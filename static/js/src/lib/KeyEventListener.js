var $ = require('jquery');

class KeyEventListener {
  constructor() {
    this.keyCode = null;
    this.callback = null;

    this.handler = (event) => {
      if (event.which === this.keyCode) {
        this.callback(event)
      }
    }
  }

  setCode(keyCode) {
    this.keyCode = keyCode;
    return this;
  }

  setHandler(callback) {
    this.callback = callback;
    return this;
  }

  listen() {
    $(document).on('keydown', this.handler);
  }

  listenOnce() {
    $(document).one('keydown', this.handler);
  }
}

module.exports = KeyEventListener;
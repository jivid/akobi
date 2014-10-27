var _ = require('underscore');
var Backbone = require('backbone');

class Socket {
  constructor() {
    _.extend(this, Backbone.Events);
    this.hash = window.location.pathname.split('/')[2];
    this.host = window.location.host;
    this.address = "ws://" + this.host + "/i/" + this.hash + "/socket";
    this.websocket = new WebSocket(this.address);
  }

  send(msg) {
    // TODO: validate message contents before sending
    msg.datetime = new Date();
    if (this.websocket.readyState === this.websocket.OPEN) {
      this.websocket.send(msg);
    }

  }
}

module.exports = Socket;
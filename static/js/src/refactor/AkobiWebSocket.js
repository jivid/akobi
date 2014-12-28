var _ = require('underscore');
var Backbone = require('backbone');
var EventBus = require('./lib/EventBus');

class Socket {
  constructor() {
    _.extend(this, Backbone.Events);
    this.hash = window.location.pathname.split('/')[2];
    this.host = window.location.host;
    this.address = "ws://" + this.host + "/i/" + this.hash + "/socket";
    this.websocket = new WebSocket(this.address);

    this.websocket.onopen = (e) => {this.trigger('open', e)};
    this.websocket.onerror = (e) => {this.trigger('error', e)};
    this.websocket.onmessage = (e) => {this.trigger('message', JSON.parse(e.data))};
    this.websocket.onclose = (e) => {
      EventBus.trigger('socket_closed');
      setTimeout(EventBus.off, 500);
    }
  }

  send(msg) {
    msg.data = msg.data || {};
    this.validateMessage(msg);

    msg.datetime = new Date();
    if (this.websocket.readyState === this.websocket.OPEN) {
      this.websocket.send(JSON.stringify(msg));
    }
  }

  validateMessage(msg) {
    if (!msg.type || (msg.interviewID !== this.hash)) {
      throw "Message missing required fields";
    }

    // JS says that null is also an object, so just checking
    // that the data field is an object isn't enough
    if (!(typeof msg.data === 'object' && msg.data !== null)) {
      throw "Message data is not an object"
    }
  }
}

module.exports = Socket;
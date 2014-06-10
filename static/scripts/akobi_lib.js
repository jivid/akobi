function isValidJSON(data){
  return $.isPlainObject(data);
}

function throwException(message) {
  throw {
    name     : "Akobi Error",
    message  : message,
    toString : function(){return this.name + ": " + this.message;}
  }
}

function validateMessageContents(msg) {
  if (msg.type === undefined) {
    throwException("Missing message type");
  }

  if (msg.clientID === undefined) {
    throwException("Missing clientID on message");
  }

  var interviewID = window.location.pathname.split('/')[2];
  if (msg.interviewID != interviewID) {
    throwException("interviewID mismatch on message");
  }
}

/* Rewrite the send() function to use our custom message format */
WebSocket.prototype.sendToServer = WebSocket.prototype.send;

WebSocket.prototype.send = function(msg) {
  validateMessageContents(msg);

  if (msg.data === undefined) {
    msg.data = {};
  } else {
    if (!isValidJSON(msg.data)) {
      throwException("malformed data being sent");
    }
  }

  msg.datetime = new Date();
  console.log(msg);
  this.sendToServer(JSON.stringify(msg));
}

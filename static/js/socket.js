define(["util"], function(util) {
    Socket = function() {
        _.extend(this, Backbone.Events);
        var _this = this;

        WebSocket.prototype.sendToServer = WebSocket.prototype.send;

        WebSocket.prototype.send = function(msg) {
            util.validateMessageContents(msg);

            if (msg.data === undefined) {
                msg.data = {};
            } else {
                if (!util.isValidJSON(msg.data)) {
                    util.throwException("Malformed data being sent");
                }
            }

            msg.datetime = new Date();
            this.sendToServer(JSON.stringify(msg));
        }

        this.hash = window.location.pathname.split('/')[2];
        this.host = window.location.host;
        this.socketAddress = "ws://" + this.host + "/i/" + this.hash + "/socket";
        this.socket = new WebSocket(this.socketAddress);

        this.socket.onopen = function(e) {
            _this.trigger("open", e);
        };

        this.socket.onerror = function(e) {
            _this.trigger("error", e);
        };

        this.socket.onmessage = function(e) {
            _this.trigger("message", JSON.parse(e.data));
        };

        this.socket.onclose = function(e) {
            EventBus.trigger("socket_closed");
            _.debounce(EventBus.off(), 500);
        };

        this.send = function(msg) {
            _this.socket.send(msg);
        };
    };

    return {
        Socket: Socket
    };
});

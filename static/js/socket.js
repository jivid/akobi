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

        this.socket.onopen = $.proxy(function(e) {
            this.trigger("open", e);
        }, this);

        this.socket.onerror = $.proxy(function(e) {
            this.trigger("error", e);
        }, this);

        this.socket.onmessage = $.proxy(function(e) {
            this.trigger("message", JSON.parse(e.data));
        }, this);

        this.socket.onclose = function(e) {
            EventBus.trigger("socket_closed");
            _.debounce(EventBus.off(), 500);
        };

        this.send = $.proxy(function(msg) {
            this.socket.send(msg);
        }, this);
    };

    return {
        Socket: Socket
    };
});

define(['socket'], function(socket) {
    var Client = Backbone.Model.extend({
        defaults: {
            id: 'someClientID',
            email: 'me@example.com',
        },

        initialize: function(obj) {
            this.id = obj.id;
        }
    });

    var Interview = Backbone.Model.extend({
        initialize: function() {
            this.socket = new socket.Socket();
            this.startTime = new Date();
            this.id = window.location.pathname.split('/')[2];
            var _this = this;

            this.socket.on("open", function(msg) {
                _this.socket.send({
                    type : 'init_interview',
                    clientID : "SomeID",
                    interviewID : _this.id
                });
            });

            this.socket.on("message", function(msg) {
                if (msg.type == "open_response") {
                    _this.client = new Client({id: msg.clientID});
                } else {
                    _this.processMessage(msg);
                }
            });
        },

        processMessage: function(msg) {
            EventBus.trigger(msg.type, msg);
        },

        initClient: function(id) {

        }
    });

    return {
        Interview: Interview
    };
});

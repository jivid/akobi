define(['socket'], function(socket) {
    var Client = Backbone.Model.extend({
        initialize: function(obj) {
            this.id = obj.id;
        }
    });

    var Interview = Backbone.Model.extend({
        initialize: function() {
            this.socket = new socket.Socket();
            this.startTime = new Date();
            this.id = window.location.pathname.split('/')[2];

            this.socket.on("open", $.proxy(function(msg) {
                this.socket.send({
                    type : 'init_interview',
                    clientID : "SomeID",
                    interviewID : this.id
                });
            }, this));

            this.socket.on("message", $.proxy(function(msg) {
                if (msg.type == "open_response") {
                    this.client = new Client({id: msg.clientID});
                } else {
                    this.processMessage(msg);
                }
            }, this));
        },

        processMessage: function(msg) {
            EventBus.trigger(msg.type, msg);
        }
    });

    return {
        Interview: Interview
    };
});

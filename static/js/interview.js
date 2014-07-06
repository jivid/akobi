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

            this.socket.on("open", $.proxy(function() {
                this.socket.send({
                    type : 'init_interview',
                    clientID : "",
                    interviewID : this.id
                });
            }, this));

            this.socket.on("message", $.proxy(function(msg) {
                if (msg.type == "open_response") {
                    console.log("Received open_response");
                    this.client = new Client({id: msg.clientID});
                } else if (msg.type == "init_finished") {
                    require('common');
                    var applications = msg.data.applications;
                    applications.forEach(function(app) {
                        console.info("Requesting JavaScript for: "
                            + app.toLowerCase());
                        require(app.toLowerCase());
                    });
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

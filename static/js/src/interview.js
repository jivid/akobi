require("./eventbus")();

var socket = require("./socket");
var $ = require("jquery");


var Interview = {
    initialize: function() {
            this.socket = new socket();
            this.startTime = new Date();
            this.id = window.location.pathname.split('/')[2];

            this.socket.on("open", $.proxy(function() {
                this.downloadApps();
            }, this));

            this.socket.on("message", $.proxy(function(msg) {
                if (msg.type == "open_response") {
                    this.client_id = msg.clientID;
                } else {
                    this.processMessage(msg);
                }
            }, this));
        },
    downloadApps: function() {
        var self = this;
        EventBus.on("download_apps", function(msg) {
            // Build a list of apps to be downloaded
            
            console.log(self);
            require("./heartbeat")(self);
            
            // Now all apps are required and we can init the interview
            self.socket.send({
                type: 'init_interview',
                clientID: '',
                interviewID: self.id
            });
        });

        this.socket.send({
            type: 'download_apps',
            clientID: '',
            interviewID: this.id
        });
    },

    processMessage: function(msg) {
        EventBus.trigger(msg.type, msg);
    }
}

module.exports = Interview

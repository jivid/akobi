/** @jsx React.DOM **/
require("./eventbus")();

var socket = require("./socket");
var $ = require("jquery");
var React = require("react");
var VideoSpace = require("./video");

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
            
            require("./heartbeat")(self);
            React.renderComponent(<VideoSpace interview={self}/>, $('#video-space').get(0));
            
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

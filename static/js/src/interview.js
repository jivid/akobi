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
                this.downloadApps();
            }, this));

            this.socket.on("message", $.proxy(function(msg) {
                if (msg.type == "open_response") {
                    this.client = new Client({id: msg.clientID});
                } else {
                    this.processMessage(msg);
                }
            }, this));
        },

        downloadApps: function() {
            EventBus.on("download_apps", function(msg) {
                // Build a list of apps to be downloaded
                var requireApps = ['common'];
                var apps = msg.data.applications;
                apps.forEach(function(app) {
                    requireApps.push(app.toLowerCase());
                });

                require(requireApps, function(){
                    // Now all apps are required and we can init the interview
                    interview.socket.send({
                        type: 'init_interview',
                        clientID: '',
                        interviewID: interview.id
                    });
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
    });

    return {
        Interview: Interview
    };
});

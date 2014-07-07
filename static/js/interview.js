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
                    this.client = new Client({id: msg.clientID});
                } else if (msg.type == "init_finished") {
                    /*
                     * Build a list of applications to be "required"
                     * based on what apps were added to the interview at
                     * creation time.
                     */
                    var requireApps = ['common'];
                    var apps = msg.data.applications;
                    apps.forEach(function(app) {
                        console.log("Adding " + app.toLowerCase()
                            + " to list of apps to be \"required\"");
                        requireApps.push(app.toLowerCase());
                    });
                    require(requireApps);
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

define(['socket', 'auth'], function(socket, auth) {
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
                auth.authenticate();
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
                        requireApps.push(app.toLowerCase());
                    });
                    require(requireApps);
                } else if (msg.type == "auth_response") {
                    if (!(msg.data.success == 1)) {
                        $('#error_label').text("Email address is invalid for this interview");
                        return;
                    }

                    auth.loginSuccess();
                } else {
                    this.processMessage(msg);
                }
            }, this));
        },

        processMessage: function(msg) {
            setTimeout(function() {
                EventBus.trigger(msg.type, msg);
            }, 500);
        },

        loadApplications: function() {
            var getAppsEnabled = function() {
                params = location.search.replace('?', '');
                params = params.split('&');
                apps = [];
                _.each(params, function(param) {
                    apps.push(param.split('=')[0]);
                });
                return apps;
            };

            var toLoad = _.map(getAppsEnabled(), function(app) {
                return app.toLowerCase();
            });

            require(toLoad);
            require(['common', 'heartbeat']);
        }
    });

    return {
        Interview: Interview
    };
});

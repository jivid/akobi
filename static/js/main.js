define(function() {
    window.stats = {};
    window.countMe = function(key) {
        stats[key] = (stats[key] || 0) + 1;
    };

    window.EventBus = {};
    _.extend(EventBus, Backbone.Events);

    require(['interview'], function(interview) {
        require.config({
            baseUrl: '/static/js'
        });

        login_button = document.getElementById("login")
        login_button.
    });

    // TODO: Move these requires to happen after receiving the list of
    //       applications for this interview so we're not running
    //       unnecessary code
    require(['common', 'heartbeat', 'notes', 'collabedit']);

    EventBus.on("auth_response", function() {
        if (msg.data.success == 1) {
            console.log(msg.data.role);
            loginSuccess();
        } else {
            
        }
    });

    function

    function loginSuccess() {
        var interview = new interview.Interview();
        window.interview = interview;
    }
});

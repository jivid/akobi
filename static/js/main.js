define(function() {
    window.stats = {};
    window.countMe = function(key) {
        stats[key] = (stats[key] || 0) + 1;
    };

    window.EventBus = {};
    _.extend(EventBus, Backbone.Events);

    require(['interview'], function(interview) {
        require.config({
            baseUrl: 'http://127.0.0.1:8000/static/js'
        });

        var interview = new interview.Interview();
        window.interview = interview;
    });

    // TODO: Move these requires to happen after receiving the list of
    //       applications for this interview so we're not running
    //       unnecessary code
    require(['common', 'heartbeat', 'notes', 'collabedit']);
});

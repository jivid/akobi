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

        var interview = new interview.Interview();
        window.interview = interview;
    });
});

define(function() {
    window.stats = {};
    window.countMe = function(key) {
        stats[key] = (stats[key] || 0) + 1;
    };

    window.EventBus = {};
    _.extend(EventBus, Backbone.Events);

    require.config({
        baseUrl: '/static/js/build',
        paths: {
            JSXTransformer: 'ext/JSXTransformer',
            DiffMatchPatch: 'ext/diff_match_patch',
            jsx: 'ext/jsx'
        },
        shim: {
            JSXTransformer: {
                exports: 'JSXTransformer'
            },
            DiffMatchPatch: {
                exports: 'DiffMatchPatch'
            }
        }
    });

    require(['interview'], function(interview) {
        var interview = new interview.Interview();
        window.interview = interview;
    });

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
});

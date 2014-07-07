define(function() {
    window.stats = {};
    window.countMe = function(key) {
        stats[key] = (stats[key] || 0) + 1;
    };

    window.EventBus = {};
    _.extend(EventBus, Backbone.Events);

    require.config({
        baseUrl: '/static/js',
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
});

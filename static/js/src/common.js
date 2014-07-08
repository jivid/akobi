define(function() {
   var AkobiApplicationView = Backbone.View.extend({
        tagName: 'div',
        className: 'app-container'
    });

    EventBus.on("init_finished", function(e) {
        return;
    });

    return {
        AkobiApplicationView: AkobiApplicationView
    }
});

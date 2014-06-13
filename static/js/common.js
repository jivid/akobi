define(function() {
    EventBus.on("init_finished", function(e) {
        console.log("Got init finished");
        console.log("Message: " + JSON.stringify(e));
    });
});

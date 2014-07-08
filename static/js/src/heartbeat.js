define(function() {
    var sendHeartbeat = function() {
        interview.socket.send({
            type: 'heartbeat',
            clientID: interview.client.id,
            interviewID: interview.id
        });
    };

    EventBus.on("heartbeat_response", function() {
        countMe("heartbeat_request_response");
    });

    var interval = setInterval(sendHeartbeat, 5000);

    EventBus.on("socket_closed", function() {
        clearInterval(interval);
    });
});

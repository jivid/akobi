require("./eventbus")();

module.exports = function(interview){

    var send = function(interview) {
        interview.socket.send({
            type: 'heartbeat',
            clientID: interview.client_id,
            interviewID: interview.id
        });
    }

    var interval = setInterval(send.bind(null, interview), 5000);
    EventBus.on("socket_closed", function() {
        clearInterval(interval);
    })
};

define(function() {
    var attemptLogin = function() {
        var email = $('#email_text').val();

        interview.socket.send({
            type: 'auth',
            clientID: '',
            interviewID: interview.id,
            data: {
                email: email
            }
        });
    };

    var loginSuccess = function() {
        $('#login_dialog').attr('visibility', 'hidden');
        $('#overlay').attr('visibility', 'hidden');

        interview.socket.send({
            type : 'init_interview',
            clientID : "",
            interviewID : interview.id
        });
    };

    var authenticate = function() {
        EventBus.on("auth_response", function(msg) {
            if (msg.data.success == 1) {
                loginSuccess();
            } else {
                $('#error_label').text("Email address is invalid for this interview");
            }
        });

        $('#login_button').on('click', attemptLogin());
    };

    return {
        authenticate: authenticate
    };
});

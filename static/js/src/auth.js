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

    var loginSuccess = function(msg) {
        $('#login_dialog').remove();
        $('#overlay').remove();

    };

    var authenticate = function() {
        EventBus.on("auth_response", function(msg) {
            if (!(msg.data.success == 1)) {
                $('#error_label').text("Email address is invalid for this interview");
                return;
            }else{
                loginSuccess(msg);
            }
        });

        $('#login_button').on('click', attemptLogin);
    };

    return {
        authenticate: authenticate,
        loginSuccess: loginSuccess
    };
});

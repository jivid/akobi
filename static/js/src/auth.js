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
        $('#login_dialog').remove();
        $('#overlay').remove();

        interview.socket.send({
            type : 'init_interview',
            clientID : "",
            interviewID : interview.id
        });
    };

    var authenticate = function() {
        $('#login_button').on('click', attemptLogin);
    };

    return {
        authenticate: authenticate,
        loginSuccess: loginSuccess
    };
});

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

        /*
         * Build a list of applications to be "required"
         * based on what apps were added to the interview at
         * creation time.
         */
        var requireApps = ['common'];
        var apps = msg.data.applications;
        apps.forEach(function(app) {
            requireApps.push(app.toLowerCase());
        });

        require(requireApps, function(){
            // At this point all apps are required and we can
            // send init finished to the server.
            interview.socket.send({
                type : 'init_interview',
                clientID : "",
                interviewID : interview.id
            });
        });
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

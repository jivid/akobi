define(function() {

    var Authentication = Backbone.Model.extend({

        initialize: function() {

            document.getElementById("login_button").onclick = this.attemptLogin;

            EventBus.on("auth_response", function(msg) {
                if (msg.data.success == 1) {
                    console.debug(msg.data.role);
                    interview.authentication.loginSuccess();
                } else {
                    console.debug("Login Error");
                    document.getElementById("error_label").innerHTML = "Email address is invalid for this interview";
                }
            });
        },

        attemptLogin: function() {
            var email_text = document.getElementById("email_text").value;

            interview.socket.send({
                type: 'auth',
                clientID: '',
                interviewID: interview.id,
                data: {
                    email: email_text
                }
            });
        },

        loginSuccess: function() {
            console.debug("Login Success");
            document.getElementById("login_dialog").style.visibility = "hidden"
            document.getElementById("overlay").style.visibility = "hidden"

            interview.socket.send({
                    type : 'init_interview',
                    clientID : "",
                    interviewID : interview.id
                });
        }
    });

    return {
        Authentication: Authentication
    };
});
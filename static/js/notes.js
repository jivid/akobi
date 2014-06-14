define(function() {
    var Note = Backbone.Model.extend({
        initialize: function() {
            this.contents = "Enter your notes here";
        },

        clear: function() {
            this.contents = "";
        },

        sync: function() {
            interview.socket.send({
                type: 'notes',
                clientID: interview.client.id,
                interviewID: interview.id,
                data: {
                    note: this.contents
                }
            });
        }
    });

    var NoteView = Backbone.View.extend({
        el: $('#notebox').parent(),

        events: {
            "focus #notebox"  : "startCapture",
            "focusout #notebox" : "stopCapture"
        },

        initialize: function() {
            this.model = new Note();
            console.log(this.$el);
        },

        /* Capture the state of the textbox every 50ms. We're not maintaining
           any history, just a dump of the entire contents. */
        startCapture: function() {
            var _this = this;
            this.capture = setInterval(function() {
                _this.model.contents = _this.$el.children('#notebox').val();
            }, 50);
        },

        /* Stop the capture and send up the latest state to the server */
        stopCapture: function() {
            if (!this.capture === undefined) {
                clearInterval(this.capture);
            }
            this.model.sync();
        }
    });

    return {
        NoteView: NoteView
    }

});

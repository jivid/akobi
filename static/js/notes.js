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
            "focusin #notebox"  : "startShortCapture",
            "focusout #notebox" : "stopShortCapture"
        },

        initialize: function() {
            this.model = new Note();

            /* Set up a simple note capture every 15 seconds so we don't
               accidentally losing any data */
            this.longCapture = setInterval(
                $.proxy(this.captureAndSync, this), 15000
            );
            EventBus.on("socket_closed", function() {
                clearInterval(this.longCapture);
            });
        },

        saveNoteState: function() {
            this.model.contents = this.$el.children('#notebox').val();
        },

        captureAndSync: function() {
            this.saveNoteState();
            this.model.sync();
        },

        /* Capture the state of the textbox every second. We're not maintaining
           any history, just a dump of the entire contents. */
        startShortCapture: function() {
            this.shortCapture = setInterval(
                $.proxy(this.saveNoteState, this), 1000
            );
        },

        /* Stop the capture and send up the latest state to the server */
        stopShortCapture: function() {
            if (!(this.shortCapture === undefined)) {
                clearInterval(this.shortCapture);
            }
            this.model.sync();
        }
    });

    new NoteView();
});

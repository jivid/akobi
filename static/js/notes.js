define(function() {
    var Note = Backbone.Model.extend({

        defaults: {
            contents : "Enter your notes here"
        },

        clear: function() {
            this.set({'contents' : ""});
        },

        sync: function() {
            interview.socket.send({
                type: 'notes',
                clientID: interview.client.id,
                interviewID: interview.id,
                data: {
                    note: this.get('contents')
                }
            });
            countMe("note_sync");
        }
    });

    var NoteBox = React.createClass({
        render: function() {
            return (
                <div>
                    <div ref="notebox" id="notebox">
                        {this.props.value}
                    </div>
                </div>
            );
        },

        componentDidMount: function() {
            var box = this.refs.notebox.getDOMNode();
        }
    });

    var NoteView = Backbone.View.extend({

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

            this.render();
        },

        render: function() {
            React.renderComponent(
                <NoteBox rows="4" cols="50" value={this.model.get('contents')} />, this.$el.get(0)
            );
            $('body').append(this.$el);
            var editor = ace.edit("notebox");
            editor.setOption("wrap", 80);
            window.editor = editor
        },

        saveNoteState: function() {
            this.model.set({'contents' : this.$el.children('#notebox').val()});
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

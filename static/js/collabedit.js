define(['ext/diff_match_patch'], function(DiffMatchPatch) {

    var ASK_DIFF = 1;
    var RECEIVED_DIFF = 2;
    var APPLY_DIFF = 3;
    var ACK = 4;

    var diffObj = new DiffMatchPatch.diff_match_patch();

    var CollabEditText = Backbone.Model.extend({

        defaults: {
            contents: "This is a collaborative editor.",
            shadow: "This is a collaborative editor."
        },

        clear: function() {
            this.set({'contents': ""});
            this.set({'shadow': ""});
        },

        getDiff: function(){
            var diff =  diffObj.diff_main(this.get('shadow'), this.get
            ('contents'));

            // Save the current text to diff agaisnt in future.
            this.set({'shadow': this.get('contents')});

            return diff;
        },

        sendDiff: function() {
            interview.socket.send({
                type: 'collabedit',
                clientID: interview.client.id,
                interviewID: interview.id,
                data: {
                    type: RECEIVED_DIFF,
                    data: this.getDiff()
                }
            });
            console.log("Diff succesfully sent");
        },

        applyDiff: function(diff){
            // Generate the patches.
            var patch = diffObj.patch_make(this.get('shadow'), diff);

            // Patch the shadow then the main text.
            this.set({'shadow' : diffObj.patch_apply(patch, this.get('shadow'))[0]});
            this.set({'contents': diffObj.patch_apply(patch, this.get('contents'))[0]});

            interview.socket.send({
                type: 'collabedit',
                clientID: interview.client.id,
                interviewID: interview.id,
                data: {
                    type: ACK,
                    data: {}
                }
            });
        }
    });

    var CollabEditBox = React.createClass({
        render: function() {
            var classString = "akobi-container";
            return (
                <div className={classString}>
                    <div id="collabedit">
                    </div>
                </div>
            );
        }
    });

    var CollabEditView = Backbone.View.extend({

        initialize: function() {
            this.model = new CollabEditText();

            this.captureInterval = setInterval(
                $.proxy(this.capture, this), 1000
            );
            EventBus.on("socket_closed", function() {
                clearInterval(this.captureInterval);
            });

            this.model.on('change:contents', function(event){
                this.$el.children('#collabedit').val(event.attributes.contents);
            }, this);

            this.render();
        },

        render: function() {
            React.renderComponent(
                <CollabEditBox rows="4" cols="50" value={this.model.get('contents')} />, this.$el.get(0)
            );
            $('body').append(this.$el);
            var editor = ace.edit("collabedit");
            editor.setOption("wrap", 80);
            editor.setTheme("ace/theme/monokai");
            editor.getSession().setMode("ace/mode/python");
        },

        capture: function() {
            this.model.set({'contents' : this.$el.children('#collabedit').val()});
        },
    });

    console.log("Creating view");
    var collabEditView = new CollabEditView();

    console.log("Setting up trigger listener");
    EventBus.on("collabedit", function(msg) {
        console.log("Got collabedit message of type " + msg.data.type);
        switch (msg.data.type){
            case ASK_DIFF:
                console.log("Sending diff");
                collabEditView.model.sendDiff();
                break;
            case APPLY_DIFF:
                console.log("Got diff: " + msg.data.data);
                collabEditView.model.applyDiff(msg.data.data);
                break;
        }
    });
});

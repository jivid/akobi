/** @jsx React.DOM **/
define(['common', 'ext/diff_match_patch'], function(common, DiffMatchPatch) {

    var ASK_DIFF = 1;
    var RECEIVED_DIFF = 2;
    var APPLY_DIFF = 3;
    var ACK = 4;
    var ASK_SHADOW = 5;
    var RECEIVED_SHADOW = 6;
    var APPLY_SHADOW = 7;

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
        },

        sendShadow: function() {
            interview.socket.send({
                type: 'collabedit',
                clientID: interview.client.id,
                interviewID: interview.id,
                data: {
                    type: RECEIVED_SHADOW,
                    data: this.get('shadow')
                }
            });
        },

        applyShadow: function(shadow) {
            this.set({'shadow': shadow});

            interview.socket.send({
                type: 'collabedit',
                clientID: interview.client.id,
                interviewID: interview.id,
                data: {
                    type: ACK,
                    data: {}
                }
            });
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
            return (
                <div id="collabedit">
                    # Welcome to the Akobi Collaborative Code Editor! Currently, we only
                    support Python syntax highlighting, but support for more languages will be added soon!
                </div>
            );
        }
    });

    var CollabEditView = common.AkobiApplicationView.extend({

        initialize: function() {
            this.model = new CollabEditText();

            this.captureInterval = setInterval(
                $.proxy(this.capture, this), 250
            );
            EventBus.on("socket_closed", function() {
                clearInterval(this.captureInterval);
            });

            this.model.on('change:contents', function(event){
                cursor = this.editor.getCursorPosition();
                this.editor.session.setValue(event.attributes.contents);
                this.editor.moveCursorToPosition(cursor);
            }, this);

            this.render();
        },

        render: function() {
            React.renderComponent(
                <CollabEditBox value={this.model.get('contents')} />, this.$el.get(0)
            );
            $('#collabedit-space').append(this.$el);
            this.editor = ace.edit("collabedit");
            this.editor.setOption("wrap", 80);
            this.editor.setTheme("ace/theme/monokai");
            this.editor.getSession().setMode("ace/mode/python");
        },

        capture: function() {
            this.model.set({'contents' : this.editor.session.doc.getValue()});
        },
    });

    var collabEditView = new CollabEditView();

    EventBus.on("collabedit", function(msg) {
        switch (msg.data.type){
            case ASK_DIFF:
                collabEditView.model.sendDiff();
                break;
            case APPLY_DIFF:
                collabEditView.model.applyDiff(msg.data.data);
                break;
            case ASK_SHADOW:
                collabEditView.model.sendShadow();
                break;
            case APPLY_SHADOW:
                collabEditView.model.applyShadow(msg.data.data);
                break;
        }
    });
});

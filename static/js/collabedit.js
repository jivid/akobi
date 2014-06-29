define(["jsx!others"], function(others) {

    var ASK_DIFF = 1;
    var RECEIVED_DIFF = 2;
    var APPLY_DIFF = 3;
    var ACK = 4;

    var diffObj = new diff_match_patch();

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

    var CollabEditView = Backbone.View.extend({
        el: $('#collabedit').parent(),

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

        capture: function() {
            this.model.set({'contents' : this.$el.children('#collabedit').val()});
        },

        render: function() {
            console.log(others.Collabedit)
        }

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
        }
    });
});

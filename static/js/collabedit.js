define(function() {
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
            this.set({'shadow': this.get('contents')})

            return diff;
        },

        sendDiff: function() {
            interview.socket.send({
                type: 'collabedit',
                clientID: interview.client.id,
                interviewID: interview.id,
                data: {
                    type: 2,
                    data: this.getDiff()
                }
            });
        },

        applyDiff: function(diff){
            // Generate the patches.
            var patch = diffObj.patch_make(this.get('shadow'), diff);

            // Patch the shadow then the main text.
            this.set({'shadow' : diffObj.patch_apply(patch, this.get('shadow'))
            [0]});
            this.set({'contents': diffObj.patch_apply(patch, this.get
            ('contents'))[0]});

            interview.socket.send({
                type: 'collabedit',
                clientID: interview.client.id,
                interviewID: interview.id,
                data: {
                    type: 4,
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
            }, this)
        },

        capture: function() {
            this.model.set({'contents' : this.$el.children('#collabedit').val
            ()});
        },

    });

    collabEditView = new CollabEditView();

    EventBus.on("collabedit", function(msg) {
        switch (msg.data.type){
            case 1:
                collabEditView.model.sendDiff();
                break;
            case 3:
                collabEditView.model.applyDiff(msg.data.data);
                break;
        }
    });
});

define(function() {
    var diffObj = new diff_match_patch();

    var CollabEditText = Backbone.Model.extend({
        initialize: function() {
            this.contents = "This is a collaborative editor.";
            this.shadow = this.contents;
        },

        clear: function() {
            this.contents = "";
            this.shadow = "";
        },

        getDiff: function(){
            console.log("");
            console.log("contents: " + this.contents);
            console.log("shadow: " + this.shadow);
            var diff =  diffObj.diff_main(this.shadow, this.contents);

            // Save the current text to diff agaisnt in future.
            this.shadow = this.contents;

            console.log("");
            console.log("got_diff");
            console.log("Diff: " + diff);

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
            var patch = diffObj.patch_make(this.shadow, diff);

            // Patch the shadow then the main text.
            this.shadow = diffObj.patch_apply(patch, this.shadow)[0];
            this.contents = diffObj.patch_apply(patch, this.contents)[0];



            console.log("applied diff: " + patch);
            console.log("text1shadow: " + this.shadow);
            console.log("text1: " + this.contents);

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

            this.model.on('change', function(contents){
                console.log("!!!!!!!!!!!!!!!! contents changed" + contents);
                this.$el.children('#collabedit').val(contents);
            }, this)
        },

        capture: function() {
            this.model.contents = this.$el.children('#collabedit').val();
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

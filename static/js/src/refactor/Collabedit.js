/** @jsx React.DOM */

var AceEditor = require('./components/AceEditor');
var Container = require('./components/Container');
var React = require('react');
var DiffMatchPatch = require('../../ext/diff_match_patch');

console.log(DiffMatchPatch);

var ASK_DIFF = 1;
var RECEIVED_DIFF = 2;
var APPLY_DIFF = 3;
var ACK = 4;
var ASK_SHADOW = 5;
var RECEIVED_SHADOW = 6;
var APPLY_SHADOW = 7;

var Collabedit = React.createClass({

  componentDidMount: function() {
    this.diffObj = new DiffMatchPatch();

    var startCapture = () => {
      this.captureInterval = setInterval(this.capture, 1000);
      EventBus.on("socket_closed", () => {
        clearInterval(this.captureInterval);
      });
    };

    startCapture();
    EventBus.on("collabedit", (msg) => {
      switch (msg.data.type){
        case ASK_DIFF:
          this.sendDiff();
          break;
        case APPLY_DIFF:
          this.applyDiff(msg.data.data);
          break;
        case ASK_SHADOW:
          this.sendShadow();
          break;
        case APPLY_SHADOW:
          console.log(msg);
          this.applyShadow(msg.data.data);
          break;
      }
    });
  },

  getInitialState: function() {
    return {
      shadow: "# Welcome to the Akobi Collaborative Code Editor!",
      content: "# Welcome to the Akobi Collaborative Code Editor!"
    }
  },

  capture: function() {
    console.log("captured document state");
    console.log(this.refs.editor.editor.session.doc.getValue());
    this.setState({content : this.refs.editor.editor.session.doc.getValue()});
  },

  getDiff: function() {
    console.log("just got diff");
    var diff = this.diffObj.diff_main(this.state.shadow, this.state.content);
    // Save the current text to diff agaisnt in future.
    this.setState({shadow: this.state.content});

    return diff;
  },

  sendDiff: function() {
    console.log("going to send diff");
    this.props.interview.socket.send({
      type: 'collabedit',
      clientID: this.props.interview.clientID,
      interviewID: this.props.interview.id,
      data: {
          type: RECEIVED_DIFF,
          data: this.getDiff()
      }
    });
  },

  sendShadow: function() {
    console.log("going to send shadow");
    this.props.interview.socket.send({
      type: 'collabedit',
      clientID: this.props.interview.clientID,
      interviewID: this.props.interview.id,
      data: {
          type: RECEIVED_SHADOW,
          data: this.state.shadow
      }
    });
  },

  applyShadow: function(shadow) {
    console.log(shadow);
    this.props.interview.socket.send({
      type: 'collabedit',
      clientID: this.props.interview.clientID,
      interviewID: this.props.interview.id,
      data: {
          type: ACK,
          data: {}
      }
    });
    console.log("Done sending");
    this.setState({shadow: shadow});
    console.log("Done setState");
    console.log("Leaving applyShadow");
  },

  applyDiff: function(diff){
    console.log("going to apply diff");
    // Generate the patches.
    var patch = this.diffObj.patch_make(this.state.shadow, diff);

    // Patch the shadow then the main text.
    this.setState({
      shadow : this.diffObj.patch_apply(patch, this.state.shadow)[0],
      content : this.diffObj.patch_apply(patch, this.state.content)[0]
    });

    this.props.interview.socket.send({
        type: 'collabedit',
        clientID: this.props.interview.clientID,
        interviewID: this.props.interview.id,
        data: {
            type: ACK,
            data: {}
        }
    });
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    var update = this.state.content != nextState.content;
    console.log("Update is " + update);
    return update;
  },

  render: function() {
    console.log("rendering collabedit");
    var width = 500;
    var containerStyle = {
      'border': '1px solid black',
      'padding': '0px',
    }

    return (
      <div>
        <Container width={width} style={containerStyle}>
          <AceEditor
            ref="editor"
            language="python"
            theme="monokai"
            name="notebox"
            editorWidth={width}
            editorHeight={500}
            showEditorControls={true}
            content={this.state.content}
          />
        </Container>
      </div>
    );
  }

});

module.exports = Collabedit;
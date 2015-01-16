/** @jsx React.DOM */

var AceEditor = require('./components/AceEditor');
var Container = require('./components/Container');
var React = require('react');
var DiffMatchPatch = require('../../ext/diff_match_patch');

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
    this.setState({content : this.refs.editor.editor.session.doc.getValue()});
  },

  getDiff: function() {
    var diff = this.diffObj.diff_main(this.state.shadow, this.state.content);
    // Save the current text to diff agaisnt in future.
    this.setState({shadow: this.state.content});

    return diff;
  },

  sendDiff: function() {
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
    this.props.interview.socket.send({
      type: 'collabedit',
      clientID: this.props.interview.clientID,
      interviewID: this.props.interview.id,
      data: {
          type: ACK,
          data: {}
      }
    });
    this.setState({shadow: shadow});
  },

  applyDiff: function(diff){
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
    return this.state.content != nextState.content;
  },

  render: function() {
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
/** @jsx React.DOM */

var AceEditor = require('./components/AceEditor');
var Container = require('./components/Container');
var React = require('react');
var DiffMatchPatch = require('../ext/diff_match_patch');

var states = {
  ASK_DIFF : 1,
  RECEIVED_DIFF : 2,
  APPLY_DIFF : 3,
  ACK : 4,
  ASK_SHADOW : 5,
  RECEIVED_SHADOW : 6,
  APPLY_SHADOW : 7,
  LANGUAGE_CHANGE : 8
}

var Collabedit = React.createClass({

  componentDidMount: function() {
    this.diffObj = new DiffMatchPatch();

    var startCapture = () => {
      this.captureInterval = setInterval(this.capture, 125);
      EventBus.on("socket_closed", () => {
        clearInterval(this.captureInterval);
      });
    };

    startCapture();
    EventBus.on("collabedit", (msg) => {
      switch (msg.data.type){
        case states.ASK_DIFF:
          this.sendDiff();
          break;
        case states.APPLY_DIFF:
          this.applyDiff(msg.data.data);
          break;
        case states.ASK_SHADOW:
          this.sendShadow();
          break;
        case states.APPLY_SHADOW:
          this.applyShadow(msg.data.data);
          break;
        case states.LANGUAGE_CHANGE:
          this.applyChangeLanguage(msg.data.data);
          break;
      }
    });
  },

  getInitialState: function() {
    var defaultState = "# Welcome to the Akobi Collaborative Code Editor!"
    return {
      shadow: defaultState,
      content: defaultState,
      language: "python"
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
          type: states.RECEIVED_DIFF,
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
          type: states.RECEIVED_SHADOW,
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
          type: states.ACK,
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
            type: states.ACK,
            data: {}
        }
    });
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.content != nextState.content;
  },

  onChangeLanguage: function(newLanguage){
    this.props.interview.socket.send({
      type: 'collabedit',
      clientID: this.props.interview.clientID,
      interviewID: this.props.interview.id,
      data: {
        type: states.LANGUAGE_CHANGE,
        language: newLanguage
      }
    })    
  },

  applyChangeLanguage: function(newLanguage){
    this.setState({language: newLanguage});  

    this.props.interview.socket.send({
        type: 'collabedit',
        clientID: this.props.interview.clientID,
        interviewID: this.props.interview.id,
        data: {
            type: states.ACK,
            data: {}
        }
    });   
  },

  render: function() {
    var containerStyle = {
      'border': '1px solid black',
      'padding': '0px',
      'width': '100%',
      'height' : '100%',
    }

    return (
      <div>
        <AceEditor
            ref="editor"
            language={this.state.language}
            theme="monokai"
            name="notebox"
            showEditorControls={true}
            content={this.state.content}
            onChangeLanguage={this.onChangeLanguage}
          />
      </div>
    );
  }

});

module.exports = Collabedit;

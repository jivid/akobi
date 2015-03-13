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

var LANGUAGE_CHANGE = 8

var Collabedit = React.createClass({

  componentDidMount: function() {
    this.diffObj = new DiffMatchPatch();

    var startCapture = () => {
      EventBus.on("socket_closed", () => {
        clearInterval(this.captureInterval);
      });
    };

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
    this.capture();
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

  applyDiff: function(diff) {
    var cursor = this.refs.editor.getCurrentCursorPosition();
    this.capture();
    // Generate the patches.
    var patch = this.diffObj.patch_make(this.state.shadow, diff);
    // Patch the shadow then the main text.
    this.setState({
      shadow : this.diffObj.patch_apply(patch, this.state.shadow)[0],
      content : this.diffObj.patch_apply(patch, this.state.content)[0]
    });
    
    // Keep the cursor synchronized. If the other person added a newline before our
    // cursor we have to adjust our y position by 1.
    var newCursor = this.getSynchronizedCursor(this.state.content, diff, cursor)
    this.refs.editor.setCurrentCursorPosition(newCursor);
    
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
  
  // Converts a cursor of format {row : row, column: column} to an absolute string offset.
  convertCursorToIndex: function(cursor, content) {
    var row = 0;
    var column = 0;
    var index;
    for (index = 0; index < content.length; index++) {
        if (column == cursor.column && row == cursor.row) {
            break;
        }
        if (content[index] == "\n") {
            column = 0;
            row++;
        } else {
            column++;
        }
    }
    return index;
  },
  
  getSynchronizedCursor: function(oldContent, diff, oldCursor) {
    // Diff is array of arrays with different types: 0 for equality, -1 for deletion
    // and 1 for insertion. Diff between house and horse [[0, "ho],[-1, "u"], [1, "r"], [0, "se"]]
    
    var newCursor = oldCursor;

    // cursorIndex is the absolute index of the oldCursor in the overall document.
    var cursorIndex = this.convertCursorToIndex(oldCursor, oldContent);
    
    // oldContentIndex is the current character we are on in the oldContent.
    var oldContentIndex = 0;
    for(var i = 0;  i < diff.length; i++) {
        change = diff[i];
        for(var j = 0; j < change[1].length; j++) {
            if (change[1][j] == "\n" && change[0] == 1) {
                // If a newline was added before the line the user is typing on. His cursor must
                // go down a line to keep on the same spot.
                newCursor.row++;
            }
            if (change[1][j] == "\n" && change[0] == -1) {
                // similarly if a new line is removed we must go up a line.
                newCursor.row--;
            }
        }
        
        // Update the position we are on in the oldContent.
        switch(change[0]) {
            case 0:
                // If the content was horse and we had [0, ho] we ca move to 'r' since we
                // know the next change will be applied there.
                oldContentIndex += change[1].length;
                break;
            case -1:
                // If the content was horse and we had [0, ho],[-1, u] we need to move the
                // pointer to after the u.
                oldContentIndex += change[1].length;
                break;
            case 1:
                // If the diff adds new content it does not affect where we are in the
                // original document. Since the original document does not have that
                // content.
                break;
        }
        
        // Once we are past the cursor index we no longer care, since anything changed
        // after the cursor index does not affect where the updated cursor should be.
        if (oldContentIndex > cursorIndex) {
            break;
        }
    };
    
    return newCursor;
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.content != nextState.content || 
      this.state.language != nextState.language;
  },

  onChangeLanguage: function(newLanguage){
    this.props.interview.socket.send({
      type: 'collabedit',
      clientID: this.props.interview.clientID,
      interviewID: this.props.interview.id,
      data: {
            type: LANGUAGE_CHANGE,
            data: newLanguage
        }
    })    
  },

  applyChangeLanguage: function(newLanguage){
    this.setState({language : newLanguage });
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

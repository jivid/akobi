/** @jsx React.DOM */

var AceEditor = require('./components/AceEditor');
var Container = require('./components/Container');
var React = require('react');

var Notes = React.createClass({

  sendNotes: function() {
    this.props.interview.socket.send({
      type: 'notes',
      clientID: this.props.interview.clientID,
      interviewID: this.props.interview.id,
      data: {
            role: document.cookie.charAt(document.cookie.length - 1),
            note: this.refs.notes.editor.session.doc.getValue()
        }
    })
  },

  componentDidMount: function() {
    setInterval(this.sendNotes, 1000);
  },

  render: function() {
    var containerStyle = {
      'border': '1px solid black',
      'padding': '0px',
      'width' : '100%',
    }

    return (
      <Container style={containerStyle}>
        <AceEditor
          ref="notes"
          name="notebox"
          theme="monokai"
          content={this.props.content}
          printMargin={false}
          showLineNumbers={false}
          showEditorControls={false}
        />
        </Container>
    );
  }

});

module.exports = Notes;
/** @jsx React.DOM */

var AceEditor = require('./components/AceEditor');
var Container = require('./components/Container');
var React = require('react');

var Notes = React.createClass({

  render: function() {
    var containerStyle = {
      'border': '1px solid black',
      'padding': '0px',
      'width' : '100%',
    }

    return (
      <Container style={containerStyle}>
        <AceEditor
          name="notebox"
          showLineNumbers={false}
          showEditorControls={false}
        />
        </Container>
    );
  }

});

module.exports = Notes;
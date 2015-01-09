/** @jsx React.DOM */

var AceEditor = require('./components/AceEditor');
var Container = require('./components/Container');
var React = require('react');

var Notes = React.createClass({

  render: function() {

    var width = 500;

    var containerStyle = {
      'border': '1px solid black',
      'padding': '0px',
    }

    return (
      <Container style={containerStyle} width={width}>
        <AceEditor
          name="notebox"
          editorWidth={width}
          editorHeight={500}
          showLineNumbers={false}
          showEditorControls={false}
        />
        </Container>
    );
  }

});

module.exports = Notes;
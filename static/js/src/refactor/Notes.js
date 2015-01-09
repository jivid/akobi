/** @jsx React.DOM */

var AceEditor = require('./components/AceEditor');
var Container = require('./components/Container');
var React = require('react');

var Notes = React.createClass({

  render: function() {

    var containerStyle = {
      'border': '1px solid black',
    }

    return (
      <div>
        <Container centered={true} style={containerStyle}>
          <AceEditor
            name="notebox"
            editorWidth={800}
            editorHeight={150}
            showLineNumbers={false}
            showEditorControls={false}
          />
        </Container>
      </div>
    );
  }

});

module.exports = Notes;
/** @jsx React.DOM */

var AceEditor = require('./components/AceEditor');
var Container = require('./components/Container');
var React = require('react');

var Collabedit = React.createClass({

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
            language="python"
            theme="monokai"
            name="notebox"
            editorWidth={width}
            editorHeight={500}
            showEditorControls={true}
          />
        </Container>
      </div>
    );
  }

});

module.exports = Collabedit;
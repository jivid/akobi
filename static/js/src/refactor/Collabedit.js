/** @jsx React.DOM */

var AceEditor = require('./components/AceEditor');
var Container = require('./components/Container');
var React = require('react');

var Collabedit = React.createClass({

  render: function() {

    var containerStyle = {
      'border': '1px solid black',
    }

    return (
      <div>
        <Container centered={true} style={containerStyle}>
          <AceEditor
            language="python"
            theme="monokai"
            name="notebox"
            editorWidth={750}
            editorHeight={500}
            showEditorControls={true}
          />
        </Container>
      </div>
    );
  }

});

module.exports = Collabedit;
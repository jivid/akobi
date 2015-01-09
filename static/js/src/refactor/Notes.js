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
      <div style={{border: "1px solid black"}}>
        <AceEditor
          name="notebox"
          editorWidth={750}
          editorHeight={500}
          showLineNumbers={false}
          showEditorControls={false}
        />
      </div>
    );
  }

});

module.exports = Notes;
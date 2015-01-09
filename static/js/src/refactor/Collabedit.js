/** @jsx React.DOM */

var AceEditor = require('./components/AceEditor');
var Container = require('./components/Container');
var Interview = require('./Interview');
var React = require('react');

var Collabedit = React.createClass({

  readyToRender: function() {
    return (this.state.interview && this.state.interview.apps);
  },

  componentWillMount: function() {
    var interviewID = window.location.pathname.split('/')[2];
    var updateApps = (apps) => {this.forceUpdate()};
    var interview = new Interview(interviewID, updateApps);

    this.setState({
      interview: interview,
    })
  },

  render: function() {
    if (!this.readyToRender()) {
      return <p>Loading</p>;
    }

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
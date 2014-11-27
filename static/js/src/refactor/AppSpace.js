/** @jsx React.DOM */

var $ = require('jquery');
var AceEditor = require('./lib/components/AceEditor');
var Interview = require('./lib/classes/Interview');
var React = require('react');

var AppSpace = React.createClass({
  appModules: {
    video: 'VideoChatApp',
    notes: 'NotesApp',
    collabedit: 'CollabeditApp',
  },

  readyToRender: function() {
    if (!this.state.interview || !this.state.interview.apps) {
      return false;
    }

    return true;
  },

  componentWillMount: function() {
    var interviewID = window.location.pathname.split('/')[2];
    var updateApps = (apps) => {this.forceUpdate()};
    var interview = new Interview(interviewID, updateApps);

    this.setState({
      interview: interview,
    })
  },

  renderModules: function() {
    var modules = [];
    this.state.interview.apps.forEach((app) => {
      modules.push(<p key={app}>{this.appModules[app]}</p>);
    })

    return modules;
  },

  render: function() {
    if (!this.readyToRender()) {
      return <p>Loading</p>;
    }

    return (
      <div>
        <p>Rendered</p>
        {this.renderModules()}
        <AceEditor
          language="python"
          theme="monokai"
          name="notebox"
          width="750px"
          height="500px"
          showEditorControls={true}
        />
      </div>
    );
  }

});

React.render(<AppSpace/>, document.body);
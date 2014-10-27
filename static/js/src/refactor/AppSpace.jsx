/**
 * @jsx React.DOM
 */

var Interview = require('./lib/classes/Interview');
var React = require('react');

var AppSpace = React.createClass({
  appModules: {
    video: 'VideoChatApp',
    notes: 'NotesApp',
    collabedit: 'CollabeditApp',
  },

  readyToRender: function() {
    if (!this.state.interview || !this.state.apps) {
      return false;
    }

    return true;
  },

  componentWillMount: function() {
    var interviewID = window.location.pathname.split('/')[2];
    var interview = new Interview(interviewID);
    var updateApps = (apps) => {
      this.setState({
        apps: apps
      });
    }

    // We don't set this callback in the interview constructor so that
    // we can control when exactly render should be triggered again
    interview.socket.on('open', interview.downloadApps.bind(updateApps));
    this.setState({
      interview: interview,
    });
  },

  renderModules: function() {
    var modules = [];
    this.state.apps.forEach((app) => {
      modules.push(this.appModules[app]);
    })
  },

  render: function() {
    if (!this.readyToRender()) {
      return (<p>Loading</p>);
    }

    return (
      <div>
        <p>Rendered</p>
        <p>{this.renderModules()}</p>
      </div>
    );
  }

});

module.exports = AppSpace;
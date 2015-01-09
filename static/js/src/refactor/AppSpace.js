/** @jsx React.DOM */

var React = require('react');
var Interview = require('./Interview');

var Collabedit = require('./Collabedit');
var Notes = require('./Notes');

var AppSpace = React.createClass({

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
    return (
      <div>
        <Collabedit />
        <Notes />
      </div>
    );
  }
});

React.render(<AppSpace />, document.body);
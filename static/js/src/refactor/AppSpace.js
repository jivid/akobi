/** @jsx React.DOM */

var Collabedit = require('./Collabedit');
var Interview = require('./Interview');
var Notes = require('./Notes');
var Video = require('./Video');
var React = require('react');

var AppSpace = React.createClass({

  readyToRender: function() {
    return (this.state.interview && this.state.interview.apps);
  },

  componentWillMount: function() {
    var interviewID = window.location.pathname.split('/')[2];
    var updateApps = (apps) => {
      // It is now safe to send initialize interview to the server as the event
      // bus is ready, and the apps have been downloaded.
      this.state.interview.socket.send({
        type: 'init_interview',
        clientID: this.state.interview.clientID,
        interviewID: this.state.interview.id,
      });
      this.forceUpdate()
    };

    // Create the interview and register the event bus.
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
        <div style={{float:"left"}}>
          <Collabedit />
        </div>
        <div style={{float:"left"}}>
          <Notes />
        </div>
         <div style={{float:"left"}}>
            <Video interview={this.state.interview}/>
         </div>
      </div>
    );
  }
});

React.render(<AppSpace />, document.body);

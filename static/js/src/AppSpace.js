/** @jsx React.DOM */

var Collabedit = require('./Collabedit');
var Interview = require('./Interview');
var React = require('react');
var Notes = require('./Notes');
var Video = require('./Video');
var StatusBar = require('./StatusBar');

var AppSpace = React.createClass({

  getInitialState: function() {
    return {
      timeElapsed: 0
    }
  },

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

      this.interval = setInterval(this.tick, 1000);

      this.forceUpdate()
    };

    // Create the interview and register the event bus.
    var interview = new Interview(interviewID, updateApps);

    this.setState({
      interview: interview,
    })
  },

  tick: function() {
    this.setState({
      timeElapsed: this.state.timeElapsed + 1,
    });
    console.log("TimeElapsed: " + this.state.timeElapsed);
  },

  render: function() {
    if (!this.readyToRender()) {
      return <p>Loading</p>;
    }
    return (
      <div>
        <div>
          <StatusBar timeElapsed={this.state.timeElapsed}/>
        </div>
        <div style={{float:"left", width:"49%", margin:"0.5%"}}>
          <Video interview={this.state.interview}/>
        </div>
        <div style={{float:"right", width:"49%", height:"750px", margin:"0.5%"}}>
          <Collabedit interview={this.state.interview}/>
        </div>
        <div style={{float:"left", width:"49%", height:"387px", margin:"0.5%"}}>
          <Notes
            interview={this.state.interview}
            content="You can take private interview notes that will be emailed to you when the interview is finished."/>
        </div>
      </div>
    );
  }
});

React.render(<AppSpace />, document.body);

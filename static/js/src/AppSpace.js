/** @jsx React.DOM */

var Collabedit = require('./Collabedit');
var Interview = require('./Interview');
var React = require('react');
var Notes = require('./Notes');
var Video = require('./Video');
var StatusBar = require('./StatusBar');
var Container = require('./components/Container')

var AppSpace = React.createClass({

  getInitialState: function() {
    return {
      timeElapsed: 0,
      onlineStatus: false
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

      this.forceUpdate()
    };

    // Create the interview and register the event bus.
    var interview = new Interview(interviewID, updateApps);

    this.setState({
      interview: interview,
    })

    EventBus.on("clients_connected", (msg) => {
      this.interval = setInterval(this.tick, 1000);
      this.setState({
        onlineStatus: true
      });
    });

    EventBus.on("client_disconnected", (msg) => {
      this.setState({
        onlineStatus: false
      });
    });
  },

  tick: function() {
    this.setState({
      timeElapsed: this.state.timeElapsed + 1,
    });
  },

  render: function() {
    if (!this.readyToRender()) {
      return <p>Loading</p>;
    }

    var transparentStyle = {
      'backgroundColor': 'rgba(0, 0, 0, 0.5)',
      'paddingLeft': '50px',
      'paddingRight': '50px',
      'paddingTop': '25px',
      'height': '800px'
    }

    var flexRowContainer = {
      'display': 'flex',
      'justifyContent': 'flex-start',
      'flexFlow': 'row wrap',
      'alignItems': 'flex-start'
    }

    var flexColContainer = {
      'display': 'flex',
      'justifyContent': 'flex-start',
      'flexFlow': 'column wrap',
      'alignItems': 'flex-start'
    }

    return (
      <div>
        <div>
          <StatusBar timeElapsed={this.state.timeElapsed} onlineStatus={this.state.onlineStatus} interview={this.state.interview}/>
        </div>
        <div style={{paddingTop:"15px", paddingLeft:"150px", paddingRight:"150px"}}>
          <Container style={transparentStyle} rounded="medium">
            <div style={{float:"left", width:"53%", margin:"0.5%"}}>
              <Video interview={this.state.interview}/>
            </div>
            <div style={{float:"right", width:"45%", height:"750px", margin:"0.5%"}}>
              <Collabedit interview={this.state.interview}/>
            </div>
            <div style={{float:"left", width:"53%", height:"387px", margin:"0.5%"}}>
              <Notes
                interview={this.state.interview}
                content="You can take private interview notes that will be emailed to you when the interview is finished."/>
            </div>
          </Container>
        </div>
      </div>
    );
  }
});

React.render(<AppSpace />, document.body);

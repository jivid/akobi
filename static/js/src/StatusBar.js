/** @jsx React.DOM */

var Container = require('./components/Container');
var React = require('react/addons');

var cx = React.addons.classSet;
var update = React.addons.update;

var StatusBar = React.createClass({
  propTypes: {
    interviewer_name: React.PropTypes.string.isRequired,
    interviewee_name: React.PropTypes.string.isRequired,
    timeElapsed: React.PropTypes.number.isRequired,
    onlineStatus: React.PropTypes.bool.isRequired,
  },

  getDefaultProps: function() {
    return {
      interviewee_name: 'Steve Osborne',
      interviewer_name: 'Divij Rajkumar',
    };
  },

  getInitialState: function() {
    return {
      timeElapsed: "0:00:00",
      onlineStatus: false,
      endInterviewModal: 'hidden',
    }
  },

  endInterview: function() {
    if (!this.state.onlineStatus) {
      return;
    }

    var msg = {
      type: 'end_interview',
      clientID: this.props.interview.clientID,
      interviewID: this.props.interview.id
    }
    this.props.interview.socket.send(msg);
    EventBus.trigger(msg.type, msg);

    this.setState({
      endInterviewModal: 'visible'
    });
    this.forceUpdate();
  },

  reJoinInterview: function() {
    location.reload();
  },

  exitInterview: function() {
    location.replace('/');
  },

  secsToHMS: function (secs) {
    var hours = Math.floor(secs / 3600)
    var minutes = Math.floor(secs / 60);
    var seconds = ((secs % 60)).toFixed(0);
    return hours + ":" + (minutes < 10 ? '0' : '') + minutes + ":"
      + (seconds < 10 ? '0' : '') + seconds;
  },

  componentWillReceiveProps: function(nextProps) {
    var newTime = this.secsToHMS(nextProps.timeElapsed);
    this.setState({
      timeElapsed: newTime,
      onlineStatus: nextProps.onlineStatus
    });
    this.forceUpdate();
  },

  render: function() {

    var containerStyle = {
      'width': '100%',
      'height': '25px',
      'backgroundColor': '#F9726D',
      'padding': '15px',
      'display': 'flex',
      'flexDirection': 'row',
      'alignItems': 'center',
      'fontSize': '16px'
    };

    var childStyle = {
      'margin': '5px',
    };

    var buttonBarStyle = {
      'display': 'flex',
      'flexDirection': 'row',
      'alignItems': 'center',
      'marginRight': '1050px'
    }

    var timeBarStyle = {
      'display': 'flex',
      'flexDirection': 'row',
      'alignItems': 'center',
      'margin-right': '50px'
    }

    var statusImage = ''
    if (this.state.onlineStatus) {
      statusImage = '/static/images/puter_online.png'
    }
    else {
      statusImage = '/static/images/puter.png'
    }

    var nameBarStyle = {
      'marginRight': '50px',
      'display': 'flex',
      'justifyContent': 'center',
      'width': '200px'
    }

    var endInterviewOverlayStyle = {
      'width': '100%',
      'height': '100%',
      'zIndex': '99999',
      'position': 'absolute',
      'left': '0px',
      'top': '0px',
      'backgroundColor': 'rgba(0, 0, 0, 0.7)',
      'visibility': this.state.endInterviewModal,
    };

    var endInterviewModalStyle = {
      'position': 'relative',
      'height': '350px',
      'width': '425px',
      'top': '35%',
      'left': '40%',
      'backgroundColor': '#FFF',
      'textAlign': 'center',
      'padding': '15px',
      'font-size': '20px',
      'display': 'flex',
      'flexDirection': 'column'
    };

    var endInterviewLabelText = 'You have left the interview. If this was done in
      error, press "Re-Join Interview" button below.'

    var reJoinButtonStyle = {
      'cursor':'pointer',
      'marginBottom': '10px',
      'padding': '10px',
      'fontSize': '18px',
      'backgroundColor': '#4C80A3'
    }

    var leaveInterviewStyle = {
      'cursor':'pointer',
      'padding': '10px',
      'fontSize': '18px',
      'backgroundColor': '#F9726D'
    }

    return (
      <div>
        <Container style={containerStyle} >
          <img style={{'marginRight':'1175px'}} src='/static/images/akobi.png'></img>
          <div style={nameBarStyle}>
            <img style={{'marginRight': '10px'}} src={statusImage}></img>
            <label style={childStyle}>{this.props.interviewer_name}</label>
          </div>
          <div style={nameBarStyle}>
            <img style={{'marginRight': '10px'}} src={statusImage}></img>
            <label style={childStyle} >{this.props.interviewee_name}</label>
          </div>
          <div style={timeBarStyle}>
            <img style={{'marginRight': '5px'}} src='/static/images/clock.png'></img>
            <label style={childStyle}>{this.state.timeElapsed}</label>
          </div>
          <button type='button' className='endInterview' onClick={this.endInterview}></button>
        </Container>
        <Container style={endInterviewOverlayStyle}>
            <Container
              rounded={'medium'}
              style={endInterviewModalStyle}>
                <label style={{'marginTop': '100px', 'marginBottom':'60px'}}>{endInterviewLabelText}</label>
                <button style={reJoinButtonStyle} className='button' type='button' onClick={this.reJoinInterview}>Re-Join Interview</button>
                <button style={leaveInterviewStyle} className='button' type='button' onClick={this.exitInterview}>Leave Interview</button>
            </Container>
        </Container>
      </div>
    );
  }

});

module.exports = StatusBar;
/** @jsx React.DOM */

var Container = require('./components/Container');
var React = require('react/addons');

var cx = React.addons.classSet;
var update = React.addons.update;

var StatusBar = React.createClass({
  propTypes: {
    timeElapsed: React.PropTypes.number.isRequired,
    onlineStatus: React.PropTypes.bool.isRequired,
    interviewer_name: React.PropTypes.string,
    interviewee_name: React.PropTypes.string,
    interval: React.PropTypes.object
  },

  getDefaultProps: function() {
    return {
      interval: null
    };
  },

  getInitialState: function() {
    return {
      timeElapsed: 0,
      onlineStatus: false,
      endInterviewModal: 'hidden',
      interviewer_name: 'interviewer_name',
      interviewee_name: 'interviewee_name'
    }
  },

  endInterview: function() {
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

  componentWillMount: function() {
    EventBus.on("clients_connected", (msg) => {
      if (this.props.interval == null) {
        this.props.interval = setInterval(this.tick, 1000);
      }
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

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      onlineStatus: nextProps.onlineStatus
    });
    this.forceUpdate()
  },

  render: function() {

    var containerStyle = {
      'width': '100%',
      'height': '55px',
      'backgroundColor': '#F9726D',
      'display': 'flex',
      'flexDirection': 'row',
      'alignItems': 'center',
      'fontSize': '16px'
    };

    var akobiLogoStyle = {
      'overflow': 'hidden',
      'width': '100px',
      'height': '28px',
      'paddingLeft' : '15px',
    };

    // flex containers for status bar components
    var onlineStatusContainer = {
      'display': 'flex',
      'flexDirection': 'row',
      'justifyContent': 'flex-end',
      'width': '70%',
      'marginRight': '0.5%'
    };

    var timeContainer = {
      'display': 'flex',
      'flexDirection': 'row',
      'justifyContent': 'flex-start',
      'alignItems': 'center',
      'width': '6%',
    };

    var childStyle = {
      'margin': '5px',
    };

    var timeBarStyle = {
      'display': 'flex',
      'flexDirection': 'row',
      'alignItems': 'center',
    }

    // I'm always online.
    var myStatus = '/static/images/puter_online.png'
    var theirStatus;
    
    // They are online if the interview has started.
    if (this.state.onlineStatus) {
      theirStatus = '/static/images/puter_online.png'
    }
    else {
      theirStatus = '/static/images/puter.png'
    }
    
    // Determine who I am and give me the right status.
    var intervieweeImage;
    var interviewerImage;
    if (document.cookie.charAt(document.cookie.length - 1) === '1') {
        intervieweeImage = myStatus;
        interviewerImage = theirStatus;
    } else {
        intervieweeImage = theirStatus;
        interviewerImage = myStatus;

    }

    var nameBarStyle = {
      'marginRight': '2em',
      'display': 'flex',
      'justifyContent': 'center',
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
      'fontSize': '20px',
      'display': 'flex',
      'flexDirection': 'column'
    };

    var endInterviewLabelText = 'You have left the interview. If this was done in' +
    ' error, press "Re-Join Interview" button below.'

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
          <div>
            <div style={akobiLogoStyle}>
              <img src='/static/images/akobi.png'></img>
            </div>
          </div>
          <div style={onlineStatusContainer}>
            <div style={nameBarStyle}>
              <img style={{'marginRight': '1em'}} src={interviewerImage}></img>
              <label style={childStyle}>{this.props.interview.interviewerName}</label>
            </div>
            <div style={nameBarStyle}>
              <img style={{'marginRight': '1em'}} src={intervieweeImage}></img>
              <label style={childStyle} >{this.props.interview.intervieweeName}</label>
            </div>
          </div>
          <div style={timeContainer}>
            <div style={timeBarStyle}>
              <img style={{'marginRight': '5px'}} src='/static/images/clock.png'></img>
              <label style={childStyle}>{this.secsToHMS(this.state.timeElapsed)}</label>
            </div>
          </div>
          <div style={{'display': 'flex', 'flexDirection': 'row', 'justifyContent': 'flex-start', 'marginLeft' : '5%', 'alignItems': 'center'}}>
            <div>
              <button type='button' className='endInterview' onClick={this.endInterview}></button>
            </div>
          </div>
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
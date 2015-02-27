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
      timeElapsed: 0,
      onlineStatus: false,
      endInterviewModal: 'hidden',
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
    this.forceUpdate();
  },

  reJoinInterview: function() {
    location.reload();
  },

  exitInterview: function() {
    location.replace('/');
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      timeElapsed: nextProps.timeElapsed,
      onlineStatus: nextProps.onlineStatus
    });
    this.forceUpdate();
  },

  render: function() {

    var containerStyle = {
      'width': '100%',
      'height': '7%',
      'background': '-moz-linear-gradient(#F9726D, #D7635F)',
      'padding': '15px',
      'float': 'left',
    };

    var childStyle = {
      'verticalAlign': 'middle',
      'margin': '5px',
    };

    var onlineStatusStyle = {
      'borderRadius': '50%',
      'width': '20px',
      'height': '20px',
      'verticalAlign': 'middle',
      'margin': '5px',
    };
    if (this.state.onlineStatus) {
      onlineStatusStyle['background'] = '#008000'
    }
    else {
      onlineStatusStyle['background'] = 'none repeat scroll 0% 0% #FF0000'
    }

    var endInterviewOverlayStyle = {
      'width': '100%',
      'height': '100%',
      'zIndex': '99999',
      'position': 'absolute',
      'left': '0px',
      'top': '0px',
      'backgroundColor': 'rgba(0, 0, 0, 0.5)',
      'visibility': this.state.endInterviewModal,
    };

    var endInterviewModalStyle = {
      'position': 'relative',
      'height': '350px',
      'width': '425px',
      'top': '35%',
      'left': '40%',
      'backgroundColor': '#32A8CF',
      'textAlign': 'center',
    };

    return (
      <div>
        <Container style={containerStyle} >
          <button style={childStyle} type='button' onClick={this.endInterview}>End Interview</button>
          <button style={childStyle} type='button'>Toggle Video</button>
          <button style={childStyle} type='button'>Toggle Mic</button>
          <label style={childStyle} name='interviewer_name_label'>{this.props.interviewer_name}</label>
          <label style={childStyle} name='interviewee_name_label'>{this.props.interviewee_name}</label>
          <label style={childStyle} name='time_elapsed_label'>{this.state.timeElapsed}</label>
          <div style={onlineStatusStyle} ></div>
        </Container>
        <Container style={endInterviewOverlayStyle}>
            <Container
              rounded={'medium'}
              style={endInterviewModalStyle}>
                <label>You have left the interview. If this was done in error, select 'Re-join Interview' below</label>
                <button type='button' onClick={this.reJoinInterview}>Re-Join Interview</button>
                <button type='button' onClick={this.exitInterview}>Leave Interview</button>
            </Container>
        </Container>
      </div>
    );
  }

});

module.exports = StatusBar;
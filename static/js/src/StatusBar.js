/** @jsx React.DOM */

var Container = require('./components/Container');
var React = require('react/addons');

var cx = React.addons.classSet;
var update = React.addons.update;

var StatusBar = React.createClass({
  propTypes: {
    interviewer_name: React.PropTypes.string.isRequired,
    interviewee_name: React.PropTypes.string.isRequired,
    interview: React.PropTypes.object.isRequired.
  },

  getDefaultProps: function() {
    return {
      interviewee_name: 'Steve Osborne',
      interviewer_name: 'Divij Rajkumar',
    };
  },

  getInitialState: function() {
    return {
      time_elapsed: 0
    }
  }

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      time_elapsed: nextProps.interview.time_elapsed > this.props.interview.time_elapsed
    });
  }

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
    }

    return (
      <Container style={containerStyle} >
        <button style={childStyle} type='button'>End Call</button>
        <button style={childStyle} type='button'>Toggle Video</button>
        <button style={childStyle} type='button'>Toggle Mic</button>
        <label style={childStyle} name='interviewer_name_label'>{this.props.interviewer_name}</label>
        <label style={childStyle} name='interviewee_name_label'>{this.props.interviewee_name}</label>
        <label style={childStyle} name='time_elapsed_label'>{this.state.time_elapsed}</label>
      </Container>
    );
  }

});

module.exports = StatusBar;
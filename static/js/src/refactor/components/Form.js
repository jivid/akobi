/** @jsx React.DOM */

var Container = require('./Container');
var React = require('react');

var Form = React.createClass({
  // TODO: Add props validation to ensure that only FormField
  // and Button are passed as children
  propTypes: {
    onSubmit: React.PropTypes.func,
  },

  render: function() {
    return (
      <Container style={{'padding': '0px'}}>
        {this.props.children}
      </Container>
    );
  },

});

module.exports = Form;
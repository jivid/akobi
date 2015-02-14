/** @jsx React.DOM */

var React = require('react');

var Button = React.createClass({
  propTypes: {
    text: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func,
    style: React.PropTypes.object,
  },

  render: function() {
    return (
      <button className='button' {...this.props}>
        {this.props.text}
      </button>
    );
  }

});

module.exports = Button;
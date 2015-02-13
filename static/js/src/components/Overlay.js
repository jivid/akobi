/** @jsx React.DOM */

var React = require('react');

var Overlay = React.createClass({
  propTypes: {
    hidden: React.PropTypes.bool,
    height: React.PropTypes.string,
  },

  getDefaultProps: function() {
    return {
      hidden: false,
      height: '100%',
    };
  },

  render: function() {
    var style = {
      display: this.props.hidden ? 'none' : 'block',
      height: this.props.height,
    }

    return (
      <div
        className='overlay'
        style={style}>
        {this.props.children}
      </div>
    );
  }

});

module.exports = Overlay;
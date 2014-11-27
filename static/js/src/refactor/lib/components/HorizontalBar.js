/** @jsx React.DOM */

var React = require('react');

var HorizontalBar = React.createClass({
  propTypes: {
    rounded: React.PropTypes.oneOf(['small', 'medium', 'large']),
    width: React.PropTypes.string,
    background: React.PropTypes.string,
    height: React.PropTypes.string,
    styles: React.PropTypes.object,
  },

  render: function() {
    var radius = '0px';
    if (this.props.rounded === 'small') {
      radius = '2px';
    } else if (this.props.rounded === 'medium') {
      radius = '4px';
    } else if (this.props.rounded === 'large') {
      radius = '8px';
    }

    var styles = {
      width: this.props.width || '100%',
      paddingTop: '2px',
      paddingBottom: '2px',
      borderRadius: radius,
      background: !this.props.background ? '#fff': this.props.background,
    };

    if (this.props.height) {
      styles.height = this.props.height;
    }

    return (
      <div style={styles}>
        {this.props.children}
      </div>
    );
  }

});

module.exports = HorizontalBar;
/** @jsx React.DOM */

var React = require('react/addons');

var cx = React.addons.classSet;
var update = React.addons.update;

var Container = React.createClass({
  propTypes: {
    rounded: React.PropTypes.oneOf([false, 'small', 'medium', 'large', 'xlarge']),
    roundedTop: React.PropTypes.bool,
    roundedBottom: React.PropTypes.bool,
    width: React.PropTypes.string,
    background: React.PropTypes.string,
    centered: React.PropTypes.bool,
    style: React.PropTypes.object,
    onClick: React.PropTypes.func,
  },

  getDefaultProps: function() {
    // Setting roundedTop and roundedBottom to true here allows
    // the caller to only specify a rounded size and get top
    // and bottom for free
    return {
      rounded: false,
      roundedTop: true,
      roundedBottom: true,
      centered: false,
    };
  },

  render: function() {
    var classes = {
      'container': true,
      'centered': this.props.centered,
    };

    if (this.props.rounded) {
      var roundedClass;
      if (this.props.roundedTop) {
        roundedClass = 'rounded-top-' + this.props.rounded;
        classes[roundedClass] = true;
      }

      if (this.props.roundedBottom) {
        roundedClass = 'rounded-bottom-' + this.props.rounded;
        classes[roundedClass] = true;
      }
    }

    var styles = {};
    if (this.props.width) {
      styles.width = this.props.width;
    }

    if (this.props.background) {
      styles.background = this.props.background;
    }

    if (this.props.style) {
      styles = update(styles, {$merge: this.props.style});
    }

    return (
      <div
        className={cx(classes)}
        style={styles}
        onClick={this.props.onClick}>
        {this.props.children}
      </div>
    );
  }

});

module.exports = Container;
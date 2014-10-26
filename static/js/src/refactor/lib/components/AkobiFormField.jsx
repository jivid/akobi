/**
 * @jsx React.DOM
 */

var React = require('react');

var cx = React.addons.classSet;

var AkobiFormField = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired,
  },

  render: function() {
    var autocomplete = this.props.autocomplete ? "on" : "off";
    var autofocus = this.props.autofocus ? "on" : "off";

    return (
      <div className={cx('form-field')}>
        <p className={cx('form-field-name')}>{this.props.title}</p>
        <input
          name={this.props.name}
          type={this.props.type}
          autofocus={autofocus}
          autocomplete={autocomplete}
          placeholder={placeholder}
        />
      </div>
    );
  }

});

module.exports = AkobiFormField;
/** @jsx React.DOM */

var Container = require('./Container');
var React = require('react/addons');

var cx = React.addons.classSet;

var FormField = React.createClass({
  propTypes: {
    autocomplete: React.PropTypes.bool,
    autofocus: React.PropTypes.bool,
    error: React.PropTypes.string,
    name: React.PropTypes.string.isRequired,
    placeholder: React.PropTypes.string,
    title: React.PropTypes.string,
    type: React.PropTypes.string,
  },

  getDefaultProps: function() {
    return {
      autocomplete: false,
      autofocus: false,
      type: 'text',
    }
  },

  render: function() {
    var autoComplete = this.props.autocomplete ? 'on' : 'off';
    var classes = {
      'form-field': true,
      'form-field-error': this.props.error ? true : false,
    };

    return (
      <div className={cx(classes)}>
        <p className='form-field-title'>
          {this.props.title}
        </p>
        <input
          ref='input'
          autoComplete={autoComplete}
          autoFocus={this.props.autofocus}
          name={this.props.name}
          type={this.props.type}
          placeholder={this.props.placeholder}
        />
      </div>
    );
  },

  getValue: function() {
    return this.refs.input.getDOMNode().value;
  }

});

module.exports = FormField;
/** @jsx React.DOM */

var React = require('react');

var LoadingThrobber = React.createClass({
  render: function() {
    return (
      <div className='spinner'>
        <div className='bounce1'/>
        <div className='bounce2'/>
        <div className='bounce3'/>
      </div>
    );
  }

});

module.exports = LoadingThrobber;
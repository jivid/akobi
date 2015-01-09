/** @jsx React.DOM */

var React = require('react');
var Collabedit = require('./Collabedit');
var Notes = require('./Notes');

var AppSpace = React.createClass({
  render: function() {
    return (
      <div>
        <Collabedit/>
        <Notes/>
      </div>
    );
  }
});

React.render(<AppSpace/>, document.body);
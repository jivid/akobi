/** @jsx React.DOM */

var React = require('react');

var Notes = React.createClass({

  render: function() {
    return (
      <div>
        <p>Rendered</p>
      </div>
    );
  }

});

React.render(<Notes />, document.getElementById('notes-space'));
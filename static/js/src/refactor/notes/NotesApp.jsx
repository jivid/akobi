/**
 * @jsx React.DOM
 */

var $ = require('jquery');
var React = require('react');

var NotesApp = React.createClass({

  render: function() {
    console.log("rendering simple div");
    return (
      <div />
    );
  }

});

React.renderComponent(<NotesApp/>, $('#app-space').get(0));

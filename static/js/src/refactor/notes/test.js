/**
 * @jsx React.DOM
 */

var $ = require('jquery');
var React = require('react');

var NotesApp = React.createClass({displayName: 'NotesApp',

  render: function() {
    console.log("rendering simple div");
    return (
      React.DOM.div(null)
    );
  }

});

console.log($('#app-space').get(0));
React.renderComponent(NotesApp(null), $('#app-space').get(0));

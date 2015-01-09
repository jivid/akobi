/** @jsx React.DOM */

var React = require('react');
var Collabedit = require('./Collabedit');
var Notes = require('./Notes');

React.render(<Collabedit/>, document.getElementById('collabedit-space'));
React.render(<Notes />, document.getElementById('notes-space'));
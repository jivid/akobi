/** @jsx React.DOM */

var ace = require('brace');
var Container = require('./Container');
var React = require('react');
var Utils = require('../lib/Utils');

// Supported Languages
require('brace/mode/javascript');
require('brace/mode/python');
require('brace/mode/java');
require('brace/mode/json');
var Languages = [
  null,
  'javascript',
  'python',
  'java',
  'json',
];

// Supported Themes
require('brace/theme/monokai');
var Themes = [
  'monokai',
];

var AceEditor = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    language: React.PropTypes.oneOf(Languages),
    theme: React.PropTypes.oneOf(Themes),
    lineWrap: React.PropTypes.number,
    editorWidth: React.PropTypes.number,
    editorHeight: React.PropTypes.number,
    showEditorControls: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      editorWidth: 300,
      editorHeight: 700,
    }
  },

  getInitialState: function() {
    return {
      language: this.props.language,
      theme: this.props.theme,
    }
  },

  aceMode: function(language) {
    return language ?
      'ace/mode/' + language :
      null;
  },

  aceTheme: function(theme) {
    return theme ?
      'ace/theme/' + theme :
      null;
  },

  /**
   * Sets up the editor with the language, theme and other
   * options supplied in the component state. Expects an
   * editor and editorSession to be attached to the component.
   */
  setupEditor: function(aceMode, aceTheme, lineWrap) {
    if (!this.editor || !this.editorSession) {
      return;
    }

    this.editorSession.setMode(aceMode);
    this.editor.setTheme(aceTheme);

    if (lineWrap) {
      this.editor.setOption('wrap', lineWrap);
    }
  },

  setupEditorFromState: function() {
    this.setupEditor(
      this.aceMode(this.state.language),
      this.aceTheme(this.state.theme),
      this.state.lineWrap
    );
    this.editor.focus();
  },

  getLanguageSelector: function() {
    var languageOptions = [];
    Languages.forEach((language) => {
      languageOptions.push(
        <option
          key={language || 'plaintext'}
          value={language}>
          {Utils.capitalizeFirstLetter(language)}
        </option>
      );
    });

    var onLanguageChange = (event) => {
      var language = event.target.value;
      if (language === this.state.language) {
        return;
      }

      this.setState({
        language: language,
      });
    }

    var languageSelector =
      <select
        onChange={onLanguageChange.bind(this)}
        defaultValue={this.state.language}>
        {languageOptions}
      </select>;

    return languageSelector;
  },

  render: function() {
    var editorName = this.props.name.trim().toLowerCase().replace(' ', '-');
    var id = "ace-editor-" + editorName;

    var editorControls =
      <Container background='#eee'>
        {this.getLanguageSelector()}
      </Container>;

    return (
      <div style={{width: this.props.editorWidth}}>
        {this.props.showEditorControls ? editorControls : null}
        <div
          ref='editor'
          id={id}
          style={{height: this.props.editorHeight}}
        />
      </div>
    );
  },

  componentDidMount: function() {
    this.editor = ace.edit(this.refs.editor.getDOMNode());
    this.editorSession = this.editor.getSession();
    this.setupEditorFromState();
  },

  componentWillUpdate: function() {
    this.editor.destroy();
  },

  componentDidUpdate: function() {
    this.setupEditorFromState();
  },

});

module.exports = AceEditor;
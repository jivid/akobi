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
    printMargin: React.PropTypes.bool,
    editorWidth: React.PropTypes.string,
    editorHeight: React.PropTypes.string,
    showLineNumbers: React.PropTypes.bool,
    showEditorControls: React.PropTypes.bool,
    content: React.PropTypes.string,
    onChangeLanguage: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      editorWidth: '100%',
      editorHeight: '100%',
      showLineNumbers: true,
      printMargin: true,
    }
  },

  getInitialState: function() {
    return {
      language: this.props.language,
      theme: this.props.theme,
      content: this.props.content
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

  getCurrentCursorPosition: function() {
    return this.editor.getCursorPosition();
  },

  setCurrentCursorPosition: function(cursor) {
    this.editor.moveCursorToPosition(cursor);
  },

  /**
   * Sets up the editor with the language, theme and other
   * options supplied in the component state. Expects an
   * editor and editorSession to be attached to the component.
   */
  setupEditor: function(aceMode, aceTheme, showLineNumbers, lineWrap, printMargin) {
    if (!this.editor || !this.editorSession) {
      return;
    }

    this.editorSession.setMode(aceMode);
    this.editor.setTheme(aceTheme);
    this.editor.renderer.setShowGutter(showLineNumbers);

    if (lineWrap) {
      this.editor.setOption('wrap', lineWrap);
    }
    if (!printMargin) {
      this.editor.setShowPrintMargin(false);
    }
  },

  setupEditorFromState: function() {
    this.setupEditor(
      this.aceMode(this.state.language),
      this.aceTheme(this.state.theme),
      this.props.showLineNumbers,
      this.state.lineWrap,
      this.props.printMargin
    );
    var cursor = this.editor.getCursorPosition();
    this.editor.session.setValue(this.state.content);
    this.editor.moveCursorToPosition(cursor);
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
      this.props.onChangeLanguage(language);
    }
    var languageSelector =
      <select
        style={{background: '#2C3029', color: 'white'}}
        onChange={onLanguageChange.bind(this)}
        defaultValue={this.state.language}
        value={this.state.language || 'plaintext'}>
        {languageOptions}
      </select>;

    return languageSelector;
  },

  render: function() {
    var editorName = this.props.name.trim().toLowerCase().replace(' ', '-');
    var id = "ace-editor-" + editorName;

    var topBarStyle = {
      'height': '33px',
      'display': 'flex',
      'alignItems': 'center',
      'justifyContent': 'flex-start',
      'paddingLeft': '5px',
    }

    var editorControls =
      <Container background='#2C3029' style={topBarStyle}>
        {this.getLanguageSelector()}
      </Container>;

    return (
      <div style={{ 'width': this.props.editorWidth}}>
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

  componentWillReceiveProps: function(nextProps) {
    this.setState({
       language: nextProps.language,
       content: nextProps.content
     });

  },

  componentDidUpdate: function() {
    this.setupEditorFromState();
  }
});

module.exports = AceEditor;

/**
 * @jsx React.DOM
 */

var AkobiBasePage = require('lib/components/AkobiBasePage');
var AkobiFormField = require('lib/components/AkobiFormField');
var AkobiNavBar = require('AkobiNavBar');
var BounceSpinner = require('BounceSpinner');
var React = require('react');

var cx = React.addons.classSet;

var AuthPage = React.createClass({
  getInitialState: function() {
    return {
      checkingCredentials: false,
    };
  },

  renderAuthBoxHeader: function() {
    return (
      <div className={cx('container-full', 'auth-box-header')}>
        <p className={cx('text-centered')}>SIGN IN TO YOUR INTERVIEW</p>
      </div>
    );
  },

  renderAuthForm: function() {
    return (
      <div className={cx('container-full', 'auth-box-content')}>
        <AkobiFormField
          ref="nameInput"
          type="text"
          name="name"
          title="NAME"
          autofocus={true}
          autocomplete={false}
          placeholder="eg. John Doe"
        />
        <AkobiFormField
          ref="emailInput"
          type="email"
          name="email"
          title="E-MAIL"
          autocomplete={false}
          placeholder="me@example.com"
        />
        <div className={cx('container-full', 'auth-box-footer')}>
          <AkobiButton
            className={cx('btn', 'btn-sign-in', 'container-full')}
            onClick={this.validateCredentials}
          />
        </div>
      </div>
    );
  },

  renderAuthBoxWithSpinnerOverlay: function() {
    return (
      <div className={cx('auth-box', 'container-centered')}>
        {this.renderAuthBoxHeader()}
        <div className={cx('overlay', 'container-full')}>
          <BounceSpinner />
        </div>
        {this.renderAuthForm()}
      </div>
    );
  },

  render: function() {
    return (
      <AkobiBasePage>
        <AkobiNavBar />
        {this.renderAuthBoxWithSpinnerOverlay()}
      </AkobiBasePage>
    );
  }

});

module.exports = AuthPage;
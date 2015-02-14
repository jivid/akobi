/** @jsx React.DOM */

var $ = require('jquery');
var Button = require('./components/Button');
var Container = require('./components/Container');
var FormField = require('./components/FormField');
var KeyEventListener = require('./lib/KeyEventListener');
var LoadingThrobber = require('./components/LoadingThrobber');
var Overlay = require('./components/Overlay');
var React = require('react/addons');

var cx = React.addons.classSet;

var AuthSpace = React.createClass({
  getInitialState: function() {
    return {
      hideOverlay: true,
      waitingForAuth: false,
      nameError: null,
      emailError: null,
    };
  },

  render: function() {
    var backgroundStyles = {
      height: '100%',
      color: '#FFFFFF',
    };

    var authBoxStyles = {
      height: '270px',
      color: '#555555',
      position: 'relative',
      boxShadow: '0 1px 30px',
      padding: '0px',
    };

    var buttonStyles = {
      marginTop: '9px',
      marginLeft: '5px',
      width: '97%',
      height: '35px',
      cursor: 'pointer',
    };

    return (
      <Container
        background='#4C80A3'
        style={backgroundStyles}>

        <Container
          centered={true}
          style={{padding: '0px', marginBottom: '50px', marginTop: '40px'}}>
          <h1 className={cx('title', 'text-center')}>Akobi</h1>
          <p className='text-center'>A better interview experience</p>
        </Container>

        <Container
          centered={true}
          background='#FFFFFF'
          width='22em'
          rounded='medium'
          style={authBoxStyles}>

          {/* Header */}
          <Container
            background='#F9726D'
            rounded='medium'
            roundedBottom={false}
            style={{height: '20px', color: '#FFFFFF', padding: '15px'}}>
            <p className='text-center'>SIGN IN TO YOUR INTERVIEW</p>
          </Container>

          <Overlay
            height='220px'
            hidden={this.state.hideOverlay}>
            <LoadingThrobber/>
          </Overlay>

          {/* Form */}
          <Container style={{padding: '0px'}}>
            <FormField
              ref='nameInput'
              name='name'
              type='text'
              title='NAME'
              placeholder='eg. John Doe'
              autofocus={!this.state.waitingForAuth}
              error={this.state.nameError}
              disabled={this.state.waitingForAuth}
            />

            <FormField
              ref='emailInput'
              name='email'
              type='email'
              title='E-MAIL'
              placeholder='eg. me@example.com'
              error={this.state.emailError}
              disabled={this.state.waitingForAuth}
            />
          </Container>

          <Button
            text='Continue'
            style={buttonStyles}
            onClick={this.submitCredentials}
          />

        </Container>
      </Container>
    );
  },

  componentDidMount: function() {
    new KeyEventListener()
      .setCode(13)  // Enter Key
      .setHandler(this.submitCredentials)
      .listen()
  },

  submitCredentials: function() {
    if (this.state.waitingForAuth) {
      console.info('Already sent creds');
      return;
    }

    this.setState({
      hideOverlay: false,
      waitingForAuth: true,
    });

    this.sendCredentialsToServer();
  },

  sendCredentialsToServer: function() {
    var name = this.refs.nameInput.getValue();
    var email = this.refs.emailInput.getValue();

    $.ajax({
      type: 'POST',
      url: '/auth' + location.search,
      data: {
        email: email,
      },
      success: () => {
        location.replace('/i/' + location.search.split('=')[1]);
      },
      error: () => {
        this.setState({
          hideOverlay: true,
          waitingForAuth: false,
        });
      },
    });
  }

});

React.render(React.createElement(AuthSpace, null), document.body);
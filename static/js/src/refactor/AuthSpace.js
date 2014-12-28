/** @jsx React.DOM */

var $ = require('jquery');
var Container = require('./lib/components/Container');
var FormField = require('./lib/components/FormField');
var KeyEventListener = require('./lib/KeyEventListener');
var React = require('react/addons');

var cx = React.addons.classSet;

var AuthSpace = React.createClass({
  getInitialState: function() {
    return {
      showOverlay: false,
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
      height: '250px',
      color: '#555555',
      position: 'relative',
      boxShadow: '0 1px 30px',
      padding: '0px',
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
          width='23em'
          rounded='medium'
          style={authBoxStyles}>

          {/* Header */}
          <Container
            background='rgba(249,81,74,0.8)'
            rounded='medium'
            roundedBottom={false}
            style={{height: '20px', color: '#FFFFFF', padding: '15px'}}>
            <p className='text-center'>SIGN IN TO YOUR INTERVIEW</p>
          </Container>

          {/* Form */}
          <Container style={{padding: '0px'}}>
            <FormField
              ref='nameInput'
              name='name'
              type='text'
              title='NAME'
              placeholder='eg. John Doe'
              autofocus={true}
              error={this.state.nameError}
            />

            <FormField
              ref='emailInput'
              name='email'
              type='email'
              title='E-MAIL'
              placeholder='eg. me@example.com'
              error={this.state.emailError}
            />
          </Container>
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
      console.log('Already sent creds');
      return;
    }

    this.sendCredentialsToServer();
    this.setState({
      showOverlay: true,
      waitingForAuth: true,
    });
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
        console.log('Auth success!');
        location.replace('/i/' + location.search.split('=')[1]);
      },
      error: () => {
        console.error('Auth failure :(');
        this.setState({
          waitingForAuth: false,
        })
      },
    });
  }

});

React.render(<AuthSpace />, document.body);
/** @jsx React.DOM **/

var $ = require('jquery');
var Button = require('./components/Button');
var Container = require('./components/Container');
var FormField = require('./components/FormField');
var React = require('react/addons');

var cx = React.addons.classSet;

var MainSpace = React.createClass({

  getBox: function(role) {
    var authBoxStyles = {
      height: '220px',
      color: '#555555',
      position: 'relative',
      boxShadow: '0 1px 30px',
      padding: '0px',
    };

    var buttonStyles = {
      marginTop: '9px',
      marginLeft: '5px',
      width: '97%',
      height: '38px',
      cursor: 'pointer',
      background: '#59CB97',
    };

    var headerText;
    var headerBackground;
    if (role === 'interviewer') {
      headerBackground = '#6DA9F9';
      headerText = 'INTERVIEWER INFORMATION';
    } else {
      headerBackground = '#3CCA84';
      headerText = 'INTERVIEWEE INFORMATION';
    }

    return (
      <Container
          centered={true}
          background='#FFFFFF'
          width='19em'
          rounded='medium'
          style={authBoxStyles}>

          {/* Header */}
          <Container
            background={headerBackground}
            rounded='medium'
            roundedBottom={false}
            style={{height: '20px', color: '#FFFFFF', padding: '15px'}}>
            <p className='text-center'>{headerText}</p>
          </Container>

          {/* Form */}
          <Container style={{padding: '0px'}}>
            <FormField
              autocomplete={false}
              ref={role + 'NameInput'}
              name={role + 'Name'}
              type='text'
              title='NAME'
              placeholder='eg. John Doe'
            />

            <FormField
              autocomplete={false}
              ref={role + 'EmailInput'}
              name={role + 'Email'}
              type='email'
              title='E-MAIL'
              placeholder='eg. me@example.com'
            />
          </Container>
        </Container>
    );
  },

  render: function() {
    var backgroundStyles = {
      height: '200px',
      color: '#FFFFFF',
    };

    var createButtonStyles = {
      marginTop: '50px',
      marginLeft: '567px',
      width: '20%',
      height: '38px',
      cursor: 'pointer',
      background: '#F9726D',
    };


    return (
      <div>
        <Container
          background='#4C80A3'
          style={backgroundStyles}>

          <Container
            centered={true}
            style={{padding: '0px', marginBottom: '50px', marginTop: '40px'}}>
            <h1 className={cx('title', 'text-center')}>Akobi</h1>
            <p className='text-center'>A better interview experience</p>
          </Container>
        </Container>

        <div style={{display: 'flex'}}>
          <div style={{marginRight: '-300px', marginLeft: '380px'}}>
            {this.getBox('interviewer')}
          </div>

          {this.getBox('interviewee')}
        </div>
        <Button
          style={createButtonStyles}
          onClick={this.createInterview}
          text='CREATE INTERVIEW'/>
      </div>
    );
  },

  createInterview: function() {
    $.ajax({
      type: 'POST',
      url: location.pathname,
      data: {
        'interviewer_name' : this.refs.interviewerNameInput.getValue(),
        'interviewer_email': this.refs.interviewerEmailInput.getValue(),
        'interviewee_name' : this.refs.intervieweeNameInput.getValue(),
        'interviewee_email': this.refs.intervieweeEmailInput.getValue(),
      },
      success: (result) => {
        location.replace('/i/' + result.interviewID)
      }
    });
  }

});

React.render(React.createElement(MainSpace, null), document.body);
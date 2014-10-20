var ENTER_KEY = 13;

function clearErrors() {
    $('.field-error').each(function(i, e){
        $(e).removeClass('field-error');
    });

    $('.text-error').remove();
}

function attachError(msg, el) {
    err = $('<span>').addClass('text-error').text(" - " + msg);
    el.append(err);
    el.parent().addClass('field-error');
}

$('#sign-in').on('click', function() {
    clearErrors();

    person = $('input[name="name"]');
    personLabel = person.siblings('p');

    email = $('input[name=email]');
    emailLabel = email.siblings('p');

    errors = false;

    // Ensure we have something to send up to the server
    if (!person.val()) {
        attachError("REQUIRED", personLabel);
        errors = true;
    }

    if (!email.val()) {
        attachError("REQUIRED", emailLabel);
        errors = true;
    }

    if (errors) {
        return false;
    }

    $('.overlay').fadeIn(200, function() {
        $('.spinner').css('display', 'block');
    })

    // Check if the email matches
    $.ajax({
        type: 'POST',
        url: location.pathname + location.search,
        data: {
            email: email.val()
        },
        success: function() {
            location.replace("/i/" + location.search.split('=')[1])
        },
        error: function(err) {
            msg = err.responseJSON.error.toUpperCase();
            console.error(msg);
            attachError(msg, emailLabel);
        },
        complete: function() {
            setTimeout(function() {
                $('.overlay').css('display', 'none');
                $('.spinner').css('display', 'none');
            }, 300);
        }
    });
});

$(document).on('keypress', function(event) {
    if (event.which == ENTER_KEY) {
        event.preventDefault();
        $('#sign-in').click();
    }
});

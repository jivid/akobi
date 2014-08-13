function clearErrors() {
    $('.field-error').each(function(i, e){
        $(e).removeClass('field-error');
    });

    $('.text-error').remove();
}

function attachError(msg, el) {
    err = $('<span>').addClass('text-error').text(msg);
    el.append(err);
    el.parent().addClass('field-error');
}

$('#sign-in').on('click', function() {
    clearErrors();
    person = $('input[name="name"]');
    email = $('input[name=email]');

    // Ensure we have something to send up to the server
    if (!person.val()) {
        attachError(" - REQUIRED", person.siblings('p'));
    }

    if (!email.val()) {
        attachError(" - REQUIRED", email.siblings('p'));
    }

    // Check if the email matches
    // Make AJAX call to server here and proceed appropriately
});

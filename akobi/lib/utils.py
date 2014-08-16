import datetime
import random

from tornado.ioloop import IOLoop

from akobi.lib.applications.base import BaseApplication


def app_name_from_msg(msg):
    """ Uses the message type to determine the application it must be routed to
    """
    if 'type' not in msg:
        return None

    words = msg['type'].split('_')
    application_name = "".join([w.title() for w in words])
    return application_name


def function_as_callback(function, *args, **kwargs):
    IOLoop.instance().add_callback(function, *args, **kwargs)


def register_timeout(timeout, method, *args, **kwargs):
    IOLoop.instance().add_timeout(timeout, method, *args, **kwargs)


def handle_message_as_callback(application, *args, **kwargs):
    """ Calls the application's handle_message method as an IOLoop callback
    """
    app_name = application.__class__.__name__
    if not isinstance(application, BaseApplication):
        raise RuntimeError("%s must subclass BaseApplication" % (app_name))
    if not hasattr(application, "handle_message"):
        raise AttributeError("%s doesn't have a handle() method" % (app_name))
    function_as_callback(application.handle_message, *args, **kwargs)


def create_message(msg_type, client, interview, **kwargs):
    """ Construct a message that complies to the protocol format. All keyword
        agrs passed in get rolled into the data field as a dict intended to be
        parsed as a JSON object. For details about the message format, check
        the Client Server Message Format wiki page
    """
    return {
        'datetime': str(datetime.datetime.now()),
        'type': msg_type,
        'clientID': client,
        'interviewID': interview,
        'data': kwargs
    }


def make_random_string(length=30,
                       allowed_chars='abcdefghijklmnopqrstuvwxyz'
                                     'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'):
    """ Generates a random alphanumeric string. Special characters are not
        included in the allowed characters because they have special meaning in
        other parts of the framework
    """
    return ''.join([random.choice(allowed_chars) for _ in range(length)])

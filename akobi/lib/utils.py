import datetime
import random

from tornado.ioloop import IOLoop

from akobi.lib.applications.base import BaseApplication


def message_type_to_application_name(message_type):
    words = message_type.split('_')
    application_name = "".join([w.title() for w in words])
    return application_name


def function_as_callback(function, *args, **kwargs):
    IOLoop.instance().add_callback(function, *args, **kwargs)


def register_timeout(timeout, method, *args, **kwargs):
    IOLoop.instance().add_timeout(timeout, method, *args, **kwargs)


# Adds the application msg handler to the bottom of the event queue.
def handle_message_as_callback(application, *args, **kwargs):
    if not isinstance(application, BaseApplication):
        raise RuntimeError("Application must subclass BaseApplication")
    if not hasattr(application, "handle_message"):
        raise AttributeError("%s doesn't have a handle() method" %
                             application.__class__.__name__)
    function_as_callback(application.handle_message, *args, **kwargs)


# Every arg after interview_id should be in the form <key>="<value>"
# to be placed into data field of message
def create_message(msg_type, client, interview, **kwargs):
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
    return ''.join([random.choice(allowed_chars) for _ in range(length)])

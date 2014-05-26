import datetime
import json
from tornado.ioloop import IOLoop

from akobi.lib.event_handlers.base import BaseEventHandler


def message_type_to_handler(message_type):
    words = message_type.split('_')
    handler = "".join([w.title() for w in words])
    return handler


def async_handle(handler, *args, **kwargs):
    if not isinstance(handler, BaseEventHandler):
            raise RuntimeError("Handler passed to async_handle must subclass "
                               + "BaseEventHandler")

    if not hasattr(handler, "handle"):
        raise AttributeError("%s doesn't have a handle() method" %
                             handler.__class__.__name__)

    IOLoop.instance().add_callback(handler.handle, *args, **kwargs)


# Every arg after interview_id should be in the form <key>="<value>"
# to be placed into data field of message
def create_message(message_type, client_id, interview_id, *args, **kwargs):
    message = {'datetime': str(datetime.datetime.now()),
               'type': message_type,
               'clientID': client_id,
               'interviewID': interview_id,
               'data': kwargs}
    return json.dumps(message)

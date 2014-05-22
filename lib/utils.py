from tornado.ioloop import IOLoop

from akobi.lib.event_handlers.base import BaseEventHandler


def message_type_to_handler(message_type):
    words = message_type.split('_')
    if (len(words) > 1):
        raise RuntimeError("Attempted to dispatch two handlers!"
                           + "Message: %s", message_type)
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

from tornado.ioloop import IOLoop

from akobi.lib.applications.base import BaseApplication


def message_type_to_application_name(message_type):
    words = message_type.split('_')
    application_name = "".join([w.title() for w in words])
    return application_name


# Adds the application msg handler to the bottom of the event queue.
def handle_message_as_callback(application, *args, **kwargs):
    if not isinstance(application, BaseApplication):
            raise RuntimeError(
                "Application passed to async_handle must subclass "
                + "BaseApplication")

    if not hasattr(application, "handle_message"):
        raise AttributeError("%s doesn't have a handle() method" %
                             handler.__class__.__name__)

    IOLoop.instance().add_callback(application.handle, *args, **kwargs)

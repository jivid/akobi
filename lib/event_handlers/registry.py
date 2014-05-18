__all__ = ('registry',)


class EventHandlerRegistry(object):
    """
    Event handler registry that is global to the application. Uses the Borg
    design pattern (bit.ly/1oxVQNI) to maintain a global list of handlers.
    """

    __shared_state = {
        "handlers": {}
    }

    def __init__(self):
        self.__dict__ = self.__shared_state

    def register(self, name, handler):
        self.handlers[name] = handler

    def find(self, handler_name):
        try:
            handler = self.handlers[handler_name]
        except KeyError:
            handler = None

        return handler

registry = EventHandlerRegistry()

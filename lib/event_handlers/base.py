class BaseEventHandler(object):
    """
    Base class that all event handlers will inherit from.
    """
    def __init__(self, *args, **kwargs):
        self.name = "Base Event Handler"

    @classmethod
    def handle(cls, *args, **kwargs):
        raise NotImplementedError


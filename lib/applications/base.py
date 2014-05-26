class BaseApplication(object):
    """
    Base class that all applications will inherit from.
    """
    def handle_message(cls, *args, **kwargs):
        raise NotImplementedError

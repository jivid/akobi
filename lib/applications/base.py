class BaseApplication(object):
    """
    Base class that all applications will inherit from.
    """
    def handle_message(self, *args, **kwargs):
        raise NotImplementedError

    def on_join(self, *args, **kwargs):
        """
        Override this no-op if you need your application to perform some
        initialization before you can begin handling client messages.
        Called every time a new client joins an interview in which your
        application is registered.
        """
        pass

    def on_client_leave(self, *args, **kwargs):
        """
        Override this no-op if you need your application to perform
        clean up or take action when a websocket is closed.
        """
        pass

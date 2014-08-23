def state(name, next, msg=None):
    """ Decorator to signify a state in the machine. Advances the machine to
        whatever is specified in 'next', and validates that the message passed
        has type 'msg' before calling the handler.
    """
    def wrap(fn):
        # Register the handler
        def wrapped_fn(*args, **kwargs):
            # Check the message
            fn(*args, **kwargs)
            # advance the state
        return wrapped_fn
    return wrap


class StateMachine(object):
    states = None
    initial = None
    current = None

    def handle(self, message):
        handler = self._get_handler(message['type'])
        handler(message)

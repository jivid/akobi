def state(name, next, prev=None):
    """ Decorator to signify a state in the machine, the expected state
        previous to it, and the next state to advance to.
    """
    def wrap(fn):
        def wrapped_fn(*args, **kwargs):
            return(name, next, prev, fn, args, kwargs)
        return wrapped_fn
    return wrap


class StateMachine(object):
    """ Mixin providing Finite State Machine functionality for an Akobi
        Application
    """
    states          = None
    msgs            = None
    initial_state   = None
    current         = None
    _callback_cache = {}

    def _meta_validate(self):
        """ Perform all necessary validations on the state machine itself. Used
            to determine whether or not the machine is ready to accept inputs
            and perform transitions
        """
        if any(attr is None for attr in\
               [self.states, self.msgs, self.initial_state]):
            return False

        if not all(type(attr) is TwoWayAttrDict for attr in\
                   [self.states, self.msgs]):
            return False

        if initial_state not in self.states or type(initial_state) is not int:
            return False

    def _input_validate(self, input_msg):
        """ Perform all necessary validations on inputs to the state machine.
            At the very least, check that the input has a type and it is one of
            the expected types provided.
        """
        input_type = input_msg.get('type', None)
        return input_type is None or input_type not in self.msgs


    def _find_callback(self, message):
        msg_type = message.get('type')
        method_name = msg_type.lower()

        # Try the cache
        from_cache = self._callback_cache.get(method_name, None)
        if from_cache is not None:
            return from_cache

        # Look through the currently defined methods for a match
        attr = getattr(self, method_name)
        if attr is None:
            return attr

        # Cache the method for future use
        self._callback_cache[method_name] = attr
        return attr

    def _advance(self, state=None):
        """ Set the state machine to a given state. If no state is specified,
            figure out the next state from where we are and move there
        """
        if state is not None:
            state_val = self.states.get(state, None)
            if state_val is None:
                raise ValueError("Invalid state transition to %s" % state)

            if type(state) is str:
                self.current = self.states.get(state)
            elif type(state) is int:
                self.current = state

            return

        # Since there was no state specified, we use the current state's
        # serialized value to figure out the next state
        real_states = len(self.states) / 2
        next_num = (self.current + 1) % real_states
        next_state = self.states.get(next_num, None)

        if next_state is None:
            raise ValueError("Missing state number %d" % next_num)

        self.current = next_num

    def _execute_callback(self, callback):
        """ Execute a callback provided by the user. Verify that the current
            state matches what the user expects before execution and return the
            state to be advanced to
        """
        state, next, prev, fn, args, kwargs = callback()
        if not self.current == prev:
            raise ValueError("Current state doesn't match expected")

        # Set the current state and execute the callback
        self.current = state
        fn(*args, **kwargs)

        return next
        

    def advance_state_machine(self, message):
        """ Advances the state machine based on a given message and the current
            state. This method is a no-op if the state machine hasn't been set
            up properly.
        """
        if not self._meta_validate() or not self._input_validate():
            return

        if not self.current is None:
            self.current = self.initial_state

        # Look for a callback to execute for this transition. If there's no
        # callback, just advance the state and return.
        callback = self._find_callback(message)
        if callback is None:
            self._advance()
            return

        next_state = self._execute_callback()
        self._advance(next_state)

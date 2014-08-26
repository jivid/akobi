import time

from akobi import log
from akobi.lib import utils
from akobi.lib.utils.datastructures import TwoWayAttrDict
from akobi.lib.utils.statemachine import state, StateMachine
from akobi.lib.applications.base import BaseApplication
from akobi.lib.applications.registry import registry


class CollabEditApplication(BaseApplication, StateMachine):
    states = TwoWayAttrDict(
        PRE_INTERVIEW       = 0,
        INITIAL             = 1,
        SHADOW_WAIT_CL1     = 2,
        SHADOW_ACK_WAIT_CL2 = 3,
        DIFF_WAIT_CL1       = 4,
        ACK_WAIT_CL1        = 5,
        DIFF_WAIT_CL2       = 6,
        ACK_WAIT_CL2        = 7
    )

    msgs = TwoWayAttrDict(
        ASK_DIFF        = 1,
        RECEIVED_DIFF   = 2,
        APPLY_DIFF      = 3,
        ACK             = 4,
        ASK_SHADOW      = 5,
        RECEIVED_SHADOW = 6,
        APPLY_SHADOW    = 7
    )

    initial_state = states.PRE_INTERVIEW

    @state("INITIAL", next="SHADOW_WAIT_CL1", prev="ACK_WAIT_CL2")
    def initial(self, message):
        self._send_message(self.sockets[1], self.msgs.ASK_SHADOW)

    @state("SHADOW_WAIT_CL1", next="SHADOW_ACK_WAIT_CL2", prev="INITIAL")
    def received_shadow(self, message):
        self._send_message(self.sockets[0], self.msgs.APPLY_SHADOW,
                           msg_data=message['data'])

    @state("SHADOW_ACK_WAIT_CL2", next="DIFF_WAIT_CL1", prev="SHADOW_WAIT_CL1")
    def ack(self, message):
        self._send_message(self.sockets[0], CollabEditHandler.ASK_DIFF)

    def __init__(self):
        self.sockets = []
        self.init_state_machine()

    def on_join(self, socket, *args, **kwargs):
        if len(self.sockets) == 2:
            log.error("More than two people tried to connect to CollabEdit")
            return

        self.sockets.add(socket)
        if len(self.sockets) == 2:
            log.debug("Two people connected to CollabEdit. Starting sync")
            self._send_message(self.sockets[1], self.msgs.ASK_SHADOW)
            self._advance(state="SHADOW_WAIT_CL1")

    def handle_message(self, message, *args, **kwargs):
        if len(sockets) < 2:
            return

        message = message['data']
        self.validate_message(message)

        # Leave it up to the state machine to handle state transitions and
        # input validation
        self.advance_state_machine(message)

class CollabEditHandler(BaseApplication):

    def on_join(self, socket, *args, **kwargs):
        if len(self.sockets) == 2:
            log.error("More than two people tried to connect to CollabEdit")
            return

        self.sockets.append(socket)
        if len(self.sockets) == 2:
            log.debug(
                "Two people connected to interview starting collabEdit "
                "synchronization.")
            self.state = CollabEditHandler.INITIAL
            self._send_message(self.sockets[1],
                               CollabEditHandler.ASK_SHADOW)
            self.state += 1

    def on_client_leave(self, socket, *args, **kwargs):
        self.state = CollabEditHandler.PRE_INTERVIEW
        self.sockets.remove(socket)

    def _invalid_message_error(self, expected, actual):
        log.error("Collabedit was expecting to receive a message of type "
                  "%s but instead got a message of type %s. while in state "
                  "%s" % (expected, actual, self.state))

    def handle_message(self, message, *args, **kwargs):
        # Collab Edit specific message data is in the data field.
        message = message['data']

        if len(self.sockets) < 2:
            return

        if self.state == CollabEditHandler.SHADOW_WAIT_CL1:
            if message['type'] != CollabEditHandler.RECEIVED_SHADOW:
                self._invalid_message_error(
                    CollabEditHandler.RECEIVED_SHADOW, message['type'])

            self._send_message(self.sockets[0], CollabEditHandler.APPLY_SHADOW,
                               msg_data=message['data'])
            self.state += 1

        elif self.state == CollabEditHandler.SHADOW_ACK_WAIT_CL2:
            if message['type'] != CollabEditHandler.ACK:
                self._invalid_message_error(CollabEditHandler.ACK, message[
                    'type'])
            self.state += 1
            self._start_synchronization_loop()

        elif self.state == CollabEditHandler.DIFF_WAIT_CL1:
            if message['type'] != CollabEditHandler.RECEIVED_DIFF:
                self._invalid_message_error(CollabEditHandler.RECEIVED_DIFF,
                                            message['type'])
            self._send_message(self.sockets[1], CollabEditHandler.APPLY_DIFF,
                               msg_data=message['data'])
            self.state += 1

        elif self.state == CollabEditHandler.ACK_WAIT_CL1:
            if message['type'] != CollabEditHandler.ACK:
                self._invalid_message_error(CollabEditHandler.ACK,
                                            message['type'])
            self._send_message(self.sockets[1], CollabEditHandler.ASK_DIFF)
            self.state += 1

        elif self.state == CollabEditHandler.DIFF_WAIT_CL2:
            if message['type'] != CollabEditHandler.RECEIVED_DIFF:
                self._invalid_message_error(CollabEditHandler.RECEIVED_DIFF,
                                            message['type'])
            self._send_message(self.sockets[0], CollabEditHandler.APPLY_DIFF,
                               msg_data=message['data'])
            self.state += 1

        elif self.state == CollabEditHandler.ACK_WAIT_CL2:
            if message['type'] != CollabEditHandler.ACK:
                self._invalid_message_error(CollabEditHandler.RECEIVED_DIFF,
                                            message['type'])
            self.state = CollabEditHandler.INITIAL
            utils.register_timeout(
                time.time() + .025, self._start_synchronization_loop)

        else:
            log.error(
                "Collabedit Got message: %s while in invalid state: %d"
                % (str(message), self.state)
            )

    def _send_message(self, socket, msg_type, msg_data=None):
        data = {'type': msg_type, 'data': msg_data}
        msg = utils.create_message(msg_type='collabedit',
                                   client=socket.client_id,
                                   interview=socket.interview_id,
                                   **data)
        socket.write_message(msg)

    def _start_synchronization_loop(self):
        self._send_message(self.sockets[0], CollabEditHandler.ASK_DIFF)
        self.state = CollabEditHandler.DIFF_WAIT_CL1


registry.register("Collabedit", CollabEditHandler)

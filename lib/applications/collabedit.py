import time

from akobi.lib.applications.registry import registry
from akobi.lib.applications.base import BaseApplication
from akobi.lib import utils
from akobi import log



class CollabEditHandler(BaseApplication):
    # Define states
    INITIAL = 1
    SHADOW_WAIT_CL1 = 2
    SHADOW_ACK_WAIT_CL2 = 3
    DIFF_WAIT_CL1 = 4
    ACK_WAIT_CL1 = 5
    DIFF_WAIT_CL2 = 6
    ACK_WAIT_CL2 = 7

    # Define message types
    ASK_DIFF = 1
    RECEIVED_DIFF = 2
    APPLY_DIFF = 3
    ACK = 4
    ASK_SHADOW = 5
    RECEIVED_SHADOW = 6
    APPLY_SHADOW = 7

    def __init__(self):
        self.sockets = []
        self.state = 0

    def on_join(self, socket, *args, **kwargs):
        if len(self.sockets) < 2:
            self.sockets.append(socket)
            if len(self.sockets) == 2:
                log.debug(
                    "Two people connected to interview starting collabEdit "
                    "synchronization.")
                self.state = CollabEditHandler.INITIAL
                self._ask_shadow(self.sockets[1])
                self.state += 1
        else:
            log.error("More than two people tried to connect to collab edit.")

    def on_client_leave(self, socket, *args, **kwargs):
        self.state = 0
        self.sockets.remove(socket)

    def _invalid_message_error(self, expected, actual):
        log.error("Collabedit was expecting to receive a message of type "
                  "%s but instead got a message of type %s. well in state %s" % (
                  expected, actual, self.state))

    def handle_message(self, message, *args, **kwargs):

        log.debug("Collabedit message %s" % str(message))
        # Collab Edit specific message data is in the data field. 
        message = message['data']

        if len(self.sockets) < 2:
            return

        if self.state == CollabEditHandler.SHADOW_WAIT_CL1:
            if message['type'] != CollabEditHandler.RECEIVED_SHADOW:
                self._invalid_message_error(
                    CollabEditHandler.RECEIVED_SHADOW, message['type'])
            CollabEditHandler._send_shadow(message['data'], self.sockets[0])
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
            CollabEditHandler._send_diff(message['data'], self.sockets[1])
            self.state += 1

        elif self.state == CollabEditHandler.ACK_WAIT_CL1:
            if message['type'] != CollabEditHandler.ACK:
                self._invalid_message_error(CollabEditHandler.ACK,
                                            message['type'])
            CollabEditHandler._ask_diff(self.sockets[1])
            self.state += 1

        elif self.state == CollabEditHandler.DIFF_WAIT_CL2:
            if message['type'] != CollabEditHandler.RECEIVED_DIFF:
                self._invalid_message_error(CollabEditHandler.RECEIVED_DIFF,
                                            message['type'])
            CollabEditHandler._send_diff(message['data'], self.sockets[0])
            self.state += 1

        elif self.state == CollabEditHandler.ACK_WAIT_CL2:
            if message['type'] != CollabEditHandler.ACK:
                self._invalid_message_error(CollabEditHandler.RECEIVED_DIFF,
                                            message['type'])
            self.state = CollabEditHandler.INITIAL
            utils.register_timeout(
                time.time() + .1, self._start_synchronization_loop)

        else:
            log.error(
                "Collabedit Got message: %s while in invalid state:  %s" %
                (str(message), str(self.state)))

    @staticmethod
    def _ask_diff(socket):
        data = {"type": CollabEditHandler.ASK_DIFF, "data": None}
        message = utils.create_message("collabedit", socket.client_id,
                                       socket.interview_id,
                                       **data)
        socket.write_message(message)

    @staticmethod
    def _ask_shadow(socket):
        data = {"type": CollabEditHandler.ASK_SHADOW, "data" : None}
        message = utils.create_message("collabedit", "",
                                       socket.interview_id, **data)
        socket.write_message(message)

    @staticmethod
    def _send_shadow(shadow, socket):
        data = {"type" : CollabEditHandler.APPLY_SHADOW, "data" : shadow}
        message = utils.create_message("collabedit", "", socket.interview_id,
                                       **data)
        socket.write_message(message)

    @staticmethod
    def _send_diff(diff, socket):
        data = {"type": CollabEditHandler.APPLY_DIFF, "data": diff}
        message = utils.create_message("collabedit", "", socket.interview_id,
                                       **data)
        socket.write_message(message)

    def _start_synchronization_loop(self):
        CollabEditHandler._ask_diff(self.sockets[0])
        self.state = CollabEditHandler.DIFF_WAIT_CL1


registry.register("Collabedit", CollabEditHandler)
import time

from akobi.lib.applications.registry import registry
from akobi.lib.applications.base import BaseApplication
from akobi.lib import utils
from akobi import log



class CollabEditHandler(BaseApplication):
    # Define states
    INITIAL = 1
    DIFF_WAIT_CL1 = 2
    ACK_WAIT_CL1 = 3
    DIFF_WAIT_CL2 = 4
    ACK_WAIT_CL2 = 5

    # Define message types
    ASK_DIFF = 1
    RECEIVED_DIFF = 2
    APPLY_DIFF = 3
    ACK = 4

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
                self._start_synchronization_loop()
        else:
            log.error("More than two people tried to connect to collab edit.")

    def _invalid_message_error(expected, actual, self):
        log.error("Collabedit was expecting to receive a message of type"
                  "%s but instead got a message of type %s." % (
                  expected, actual))

    def handle_message(self, message, *args, **kwargs):

        # Collab Edit specific message data is in the data field. 
        message = message['data']

        if self.state == CollabEditHandler.DIFF_WAIT_CL1:
            if message['type'] != CollabEditHandler.RECEIVED_DIFF:
                self._invalid_message_error(CollabEditHandler.RECEIVED_DIFF,
                                            message["type"])
            CollabEditHandler._send_diff(message["data"], self.sockets[1])
            self.state += 1

        elif self.state == CollabEditHandler.ACK_WAIT_CL1:
            if message['type'] != CollabEditHandler.ACK:
                self._invalid_message_error(CollabEditHandler.RECEIVED_DIFF,
                                            message["type"])
            CollabEditHandler._ask_diff(self.sockets[1])
            self.state += 1

        elif self.state == CollabEditHandler.DIFF_WAIT_CL2:
            if message['type'] != CollabEditHandler.RECEIVED_DIFF:
                self._invalid_message_error(CollabEditHandler.RECEIVED_DIFF,
                                            message["type"])
            CollabEditHandler._send_diff(message["data"], self.sockets[0])
            self.state += 1

        elif self.state == CollabEditHandler.ACK_WAIT_CL2:
            if message['type'] != CollabEditHandler.ACK:
                self._invalid_message_error(CollabEditHandler.RECEIVED_DIFF,
                                            message["type"])
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
    def _send_diff(diff, socket):
        data = {"type": CollabEditHandler.APPLY_DIFF, "data": diff}
        message = utils.create_message("collabedit", "", "", **data)
        socket.write_message(message)

    def _start_synchronization_loop(self):
        CollabEditHandler._ask_diff(self.sockets[0])
        self.state += 1


registry.register("Collabedit", CollabEditHandler)
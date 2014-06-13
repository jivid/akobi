import json

from tornado.ioloop import IOLoop
from akobi.lib.applications.registry import registry
from akobi.lib.applications.base import BaseApplication
from akobi import log
from akobi.lib import utils



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
        self.sockets.append(socket)
        if len(self.sockets) == 2:
            log.debug("Two people connected to interview starting collabEdit synchronization.")
            self.state = CollabEditHandler.INITIAL
            self.__start_synchronization_loop()

    def __invalid_message_error(expected, actual, self):
        log.error(""" Collabedit was expecting to receive a message of type %s but instead got a
                      message of type %s.""" % (expected, actual))

    def handle_message(self, message, *args, **kwargs):

        # Collab Edit specific message data is in the data field. 
        message = message["data"]
        if len(self.sockets) != 2:
            log.error("More than two people connected to collab edit.")
            return

        if self.state == CollabEditHandler.DIFF_WAIT_CL1:
            if message["type"] != CollabEditHandler.RECEIVED_DIFF:
                self.__invalid_message_error(CollabEditHandler.RECEIVED_DIFF, message["type"])
            self.__send_diff(message["data"], self.sockets[1])
            self.state += 1

        elif self.state == CollabEditHandler.ACK_WAIT_CL1:
            if message["type"] != CollabEditHandler.ACK:
                self.__invalid_message_error(CollabEditHandler.RECEIVED_DIFF, message["type"])
            self.__ask_diff(self.sockets[1])
            self.state += 1

        elif self.state == CollabEditHandler.DIFF_WAIT_CL2:
            if message["type"] != CollabEditHandler.RECEIVED_DIFF:
                self.__invalid_message_error(CollabEditHandler.RECEIVED_DIFF, message["type"])
            self.__send_diff(message["data"], self.sockets[0])
            self.state += 1

        elif self.state == CollabEditHandler.ACK_WAIT_CL2:
            if message["type"] != CollabEditHandler.ACK:
                self.__invalid_message_error(CollabEditHandler.RECEIVED_DIFF, message["type"])
            self.state = CollabEditHandler.INITIAL
            IOLoop.instance().add_timeout(.1, self.__start_synchronization_loop)

        else:
            log.error(
                "Collabedit Got message : " + str(message) + " while in invalid state: "
                + str(self.state))

    def __ask_diff(self, socket):
        data = {"type": CollabEditHandler.ASK_DIFF, "data": None}
        message = utils.create_message("collabedit", "", "", **data)
        socket.write_message(message)

    def __send_diff(self, diff, socket):
        data = {"type": CollabEditHandler.APPLY_DIFF, "data" : diff}
        message = utils.create_message("collabedit", "", "", **data)
        socket.write_message(message)

    def __start_synchronization_loop(self):
        self.__ask_diff(self.sockets[0])
        self.state += 1

registry.register("Collabedit", CollabEditHandler)
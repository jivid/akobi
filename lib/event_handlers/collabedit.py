import json
from tornado.ioloop import IOLoop
from akobi.lib.event_handlers.registry import registry
from akobi.lib.event_handlers.base import BaseEventHandler


class CollabEditHandler(BaseEventHandler):

    # Define states
    INITIAL = 1
    DIFF_WAIT_CL1 = 2
    ACK_WAIT_CL1 = 3
    DIFF_WAIT_CL2 = 4
    ACK_WAIT_CL2 = 5

    def __init__(self):
        self.sockets = []
        self.interview_id = 0
        self.interview_states = {}

    def handle(self, message, interview, interview_id, *args, **kwargs):

        self.sockets = list(interview)
        self.interview_id = interview_id

         # Collab Edit specific message data is in the data field. 
        message = message["data"]
        if len(self.sockets) != 2:
            # We only want to do anything if we have 2 connected clients.
            return

        if self.interview_id not in self.interview_states:
            self.interview_states[self.interview_id] = CollabEditHandler.INITIAL
            self.start_synchronization_loop()
          
        if self.interview_states[self.interview_id] == CollabEditHandler.DIFF_WAIT_CL1:
            self.wait_for_diff_then_send(message["data"], self.sockets[1])
            self.interview_states[self.interview_id]  = self.interview_states[self.interview_id] + 1

        elif self.interview_states[self.interview_id]  == CollabEditHandler.ACK_WAIT_CL1:
            self.wait_for_ack_then_ask_diff(self.sockets[1])
            self.interview_states[self.interview_id]  = self.interview_states[self.interview_id] + 1

        elif self.interview_states[self.interview_id]  == CollabEditHandler.DIFF_WAIT_CL2:
            self.wait_for_diff_then_send(message["data"], self.sockets[0])
            self.interview_states[self.interview_id] = self.interview_states[self.interview_id]  + 1

        elif self.interview_states[self.interview_id]  == CollabEditHandler.ACK_WAIT_CL2:
            self.interview_states[self.interview_id]  = CollabEditHandler.INITIAL
            IOLoop.instance().add_timeout(.1, self.start_synchronization_loop)

        else:
            print "got message : "  + str(message) + "while in invalid state: " + str(self.interview_states[self.interview_id])
        
    def write_message(self, message, socket):
        #  print("Writing message: " + str(message))
        package = {}
        package["datetime"] = ""
        package["type"] = "collabedit"
        package["clientId"] = ""
        package["interviewID"] = self.interview_id
        package["data"] = message
        socket.write_message(json.dumps(package))

    def ask_diff(self, socket):
        message = {}
        message["type"] = 1
        message["data"] = None
        self.write_message(message, socket)
    def wait_for_diff_then_send(self, diff, socket):
        message = {}
        message["type"] = 3
        message["data"] = diff
        self.write_message(message, socket)

    def wait_for_ack_then_ask_diff(self, socket):
        message = {}
        message["type"] = 1
        message["data"] = None
        self.write_message(message, socket)

    def start_synchronization_loop(self):
        print("")
        print("starting synchronization loop asking for diff from client 1")
        print str(self.sockets[0])
        self.ask_diff(self.sockets[0])
        self.interview_states[self.interview_id] = self.interview_states[self.interview_id] + 1

registry.register("Collabedit", CollabEditHandler())
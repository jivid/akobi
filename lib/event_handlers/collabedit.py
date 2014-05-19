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

    state = 0

    interviews = {}

    def handle(self, message, interviews, *args, **kwargs):
        # Collab Edit specific message data is in the data field.    
        message = message["data"]
        CollabEditHandler.interviews = interviews
        if len(interviews) > 2:
            print("Too many users connected to collabedit")

        print("got message " + message)
        if CollabEditHandler.state == DIFF_WAIT_CL1:
            print("state was waiting for diff from client 1 now sending diff to client 2")
            wait_for_diff_then_send(json.loads(message)["data"], interviews[1])

        elif CollabEditHandler.state == ACK_WAIT_CL1:
            print("state was waiting for ack from client 1 now asking for diff from client 2")
            wait_for_ack_then_ask_diff(interviews[1])

        elif CollabEditHandler.state == DIFF_WAIT_CL2:
            print("state was waiting for diff from client 2 now sending diff to client 1")
            wait_for_diff_then_send(json.loads(message)["data"], interviews[0])

        elif CollabEditHandler.state == ACK_WAIT_CL2:
            print("state was waiting for ack from client 2 going to initial state")
            wait_for_ack()
            IOLoop.instance().add_timeout(.1, restart_synchronization_loop)

        else:
            print "got message while in invalid state"
        
    def write_message(message, socket):
        print("Writing message: " + message)
        socket.write_message(message)

    def ask_diff(socket):
        message = {}
        message["type"] = 1
        message["data"] = None
        write_message(json.dumps(message), socket)
        state = state + 1

    def wait_for_diff_then_send(diff, socket):
        message = {}
        message["type"] = 3
        message["data"] = diff
        write_message(json.dumps(message), socket)
        state = state + 1

    def wait_for_ack_then_ask_diff(socket):
        message = {}
        message["type"] = 1
        message["data"] = None
        write_message(json.dumps(message), socket)
        state = state + 1

    def wait_for_ack():
        state = States.INITIAL

    def restart_synchronization_loop():
        print("")
        print("starting again asking for diff from client 1")
        ask_diff(CollabEditHandler.interviews[0])

registry.register("CollabEdit", CollabEditHandler)
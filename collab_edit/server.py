import json
import time

from tornado.web import RequestHandler, Application
from tornado.websocket import WebSocketHandler
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop

state = 0


class States:
    INITIAL = 1
    DIFF_WAIT_CL1 = 2
    ACK_WAIT_CL1 = 3
    DIFF_WAIT_CL2 = 4
    ACK_WAIT_CL2 = 5


def write_message(message, socket):
    print("Writing message: " + message)
    socket.write_message(message)


def ask_diff(socket):
    global state
    message = {}
    message["type"] = 1
    message["data"] = None
    write_message(json.dumps(message), socket)
    state = state + 1


def wait_for_diff_then_send(diff, socket):
    global state
    message = {}
    message["type"] = 3
    message["data"] = diff
    write_message(json.dumps(message), socket)
    state = state + 1


def wait_for_ack_then_ask_diff(socket):
    global state
    message = {}
    message["type"] = 1
    message["data"] = None
    write_message(json.dumps(message), socket)
    state = state + 1


def wait_for_ack():
    global state
    state = States.INITIAL


class SocketHandler(WebSocketHandler):
    sockets = []

    def open(self):
        global state
        if len(SocketHandler.sockets) >= 2:
            print("Too many Connections")
            return

        print("adding client to socket list")
        if self not in SocketHandler.sockets:
            SocketHandler.sockets.append(self)
            print ("successfully added to list")

        if len(SocketHandler.sockets) == 2:
            print ("two clients have connected asking for diff from client 1")
            state = States.INITIAL
            ask_diff(SocketHandler.sockets[0])

    def on_message(self, message):
        global state
        print("got message " + message)
        if state == States.DIFF_WAIT_CL1:
            print("state was waiting for diff from client 1 now sending diff to client 2")
            wait_for_diff_then_send(json.loads(message)["data"], SocketHandler.sockets[1])

        elif state == States.ACK_WAIT_CL1:
            print("state was waiting for ack from client 1 now asking for diff from client 2")
            wait_for_ack_then_ask_diff(SocketHandler.sockets[1])

        elif state == States.DIFF_WAIT_CL2:
            print("state was waiting for diff from client 2 now sending diff to client 1")
            wait_for_diff_then_send(json.loads(message)["data"], SocketHandler.sockets[0])

        elif state == States.ACK_WAIT_CL2:
            print("state was waiting for ack from client 2 going to initial state")
            wait_for_ack()

        elif state == States.INITIAL:
            time.sleep(30)
            print("")
            print("starting again asking for diff from client 1")
            ask_diff(SocketHandler.sockets[0])

    def on_close(self):
        pass

application = Application([
    (r"/", SocketHandler),
])

if __name__ == "__main__":
    application.listen(8888)
    IOLoop.instance().start()
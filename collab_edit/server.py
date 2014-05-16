import json

from tornado.web import RequestHandler, Application
from tornado.websocket import WebSocketHandler
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop


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
    message = {}
    message["type"] = 1
    message["data"] = None
    write_message(json.dumps(message), socket)
    SocketHandler.state = SocketHandler.state + 1


def wait_for_diff_then_send(diff, socket):
    message = {}
    message["type"] = 3
    message["data"] = diff
    write_message(json.dumps(message), socket)
    SocketHandler.state = SocketHandler.state + 1


def wait_for_ack_then_ask_diff(socket):
    message = {}
    message["type"] = 1
    message["data"] = None
    write_message(json.dumps(message), socket)
    SocketHandler.state = SocketHandler.state + 1


def wait_for_ack():
    SocketHandler.state = States.INITIAL


class SocketHandler(WebSocketHandler):
    sockets = []
    state = 0

    def open(self):
        if len(SocketHandler.sockets) >= 2:
            print("Too many Connections")
            return

        if self not in SocketHandler.sockets:
            SocketHandler.sockets.append(self)

        if len(SocketHandler.sockets) == 2:
            state = States.INITIAL
            ask_diff(SocketHandler.sockets[1])

    def on_message(self, message):
        print("got message " + message)
        if SocketHandler.state == States.DIFF_WAIT_CL1:
            wait_for_diff_then_send(json.loads(message), SocketHandler.sockets[2])

        elif SocketHandler.state == States.ACK_WAIT_CL1:
            wait_for_ack_then_ask_diff(SocketHandler.sockets[2])

        elif SocketHandler.state == States.DIFF_WAIT_CL2:
            wait_for_diff_then_send(json.loads(message), SocketHandler.sockets[1])

        elif SocketHandler.state == States.ACK_WAIT_CL2:
            wait_for_ack()

        elif SocketHandler.state == States.INITIAL:
            ask_diff(SocketHandler.sockets[1])

    def on_close(self):
        pass

application = Application([
    (r"/", SocketHandler),
])

if __name__ == "__main__":
    application.listen(8888)
    IOLoop.instance().start()
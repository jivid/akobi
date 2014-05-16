import json
import random

from tornado.web import RequestHandler, Application
from tornado.websocket import WebSocketHandler
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop

from heartbeathandler import HeartbeatHandler

settings = {'auto_reload': True, 'debug': True}


class IndexHandler(RequestHandler):
    def get(self, interview):
        self.render('index.html')


class InterviewHandler(WebSocketHandler):
    ongoing_interviews = {}

    def open(self, interview):
        print "Web socket connection opened."
        if interview not in InterviewHandler.ongoing_interviews:
            InterviewHandler.ongoing_interviews[interview] = set()
        self.clientID = random.randint(1, 100)
        InterviewHandler.ongoing_interviews[interview].add(self)

        # TODO (Warren): Manage clientIDs using Redis
        # For now just assign a random integer from 0 to 100 for a client id
        self.write_message(json.dumps({"client_id": self.clientID}))

    def on_message(self, message):
        message = json.loads(message)
        print "Received from web socket: %s" % str(message)

        interview = message['interview_id']
        clientID = message['client_id']

        # TODO (Warren): Manage interviewIDs using Redis
        # For now stick in hash table
        conns = InterviewHandler.ongoing_interviews[interview]

        if message['type'] == 'send_data':
            for conn in conns:
                conn.write_message(message['data'])
        elif message['type'] == 'heartbeat':
            for conn in conns:
                if conn.clientID == clientID:
                    heartbeatHandler.handle(conn)

    def on_close(self):
        print(u"Web socket connection closed.")


app = Application([
    (r'/i/(\w+)/', IndexHandler),
    (r'/i/(\w+)/sock', InterviewHandler),
    ], **settings)

heartbeatHandler = HeartbeatHandler()


def main():
    http_server = HTTPServer(app)
    http_server.listen(8888)
    IOLoop.instance().start()


if __name__ == '__main__':
    main()

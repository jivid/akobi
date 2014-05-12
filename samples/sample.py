import json

from tornado.web import RequestHandler, Application
from tornado.websocket import WebSocketHandler
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop


class IndexHandler(RequestHandler):
    def get(self, interview):
        self.render('index.html')


class InterviewHandler(WebSocketHandler):
    ongoing_interviews = {}

    def open(self, interview):
        print(u"opened.")
        if not interview in InterviewHandler.ongoing_interviews:
            InterviewHandler.ongoing_interviews[interview] = set()

        print "Adding %s to interview %s" % (str(self), interview)
        InterviewHandler.ongoing_interviews[interview].add(self)

    def on_message(self, message):
        message = json.loads(message)
        print "Got message: %s" % str(message)
        interview = message['hash']
        conns = InterviewHandler.ongoing_interviews[interview]
        print "Going to send message to %d connections" % (len(conns))
        for conn in conns:
            conn.write_message(message['data'])

    def on_close(self):
        print(u"closed.")


settings = {'auto_reload': True, 'debug': True}

# TODO: Ensure that a new SampleWebSocket instance isn't started for each
# connection to the same URL path. This probably involves us writing some
# middleware to route incoming connections to their respective websocket
# handlers. (i.e. 1 per interview)
app = Application([
    (r'/i/(.*)/', IndexHandler),
    (r'/i/(.*)/sock', InterviewHandler),
    ], **settings)


def main():
    http_server = HTTPServer(app)
    http_server.listen(8888)
    IOLoop.instance().start()


if __name__ == '__main__':
    main()

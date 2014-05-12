from tornado.web import RequestHandler, Application
from tornado.websocket import WebSocketHandler
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop


class IndexHandler(RequestHandler):
    def get(self):
        self.render('index.html')

conns = set()

class SampleWebSocket(WebSocketHandler):

    def open(self, username):
        print(u"opened.")
        conns.add(self)

    def on_message(self, message):
        for conn in conns:
            conn.write_message(message)

    def on_close(self):
        print(u"closed.")


settings = {'auto_reload': True, 'debug': True}

app = Application([
    (r'/', IndexHandler),
    (r'/user/(.*)', SampleWebSocket),
    ], **settings)


def main():
    http_server = HTTPServer(app)
    http_server.listen(8888)
    IOLoop.instance().start()


if __name__ == '__main__':
    main()

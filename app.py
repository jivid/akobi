from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.web import Application
from handlers import interview, index

settings = {'auto_reload': True, 'debug': True}

app = Application([
    (r'/interview', index.IndexHandler),
    (r'/interview/socket', interview.InterviewHandler),
    ], **settings)


def main():
    http_server = HTTPServer(app)
    http_server.listen(8888)
    IOLoop.instance().start()


if __name__ == '__main__':
    main()
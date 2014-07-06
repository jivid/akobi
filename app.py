from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.web import Application, StaticFileHandler
from akobi.handlers import interview, index

settings = {'auto_reload': True, 'debug': True}

app = Application([
    (r'/', index.IndexHandler),
    (r'/setup_complete', index.SetupHandler),
    (r'/static/(.*)', StaticFileHandler, {'path': './static/'}),
    (r'/i/(\w+)', index.InterviewHandler),
    (r'/i/(\w+)/socket', interview.InterviewHandler),
    ], **settings)


def main():
    http_server = HTTPServer(app)
    http_server.listen(8888)
    IOLoop.instance().start()


if __name__ == '__main__':
    main()

import os
import sys

from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.web import Application, StaticFileHandler, RequestHandler

from akobi.handlers import interview, index

settings = {
    'auto_reload': True,
    'debug': True,
    'template_path': os.path.join(os.path.dirname(__file__), 'templates')
}

app = Application([
    (r'/', index.IndexHandler),
    (r'/static/(.*)', StaticFileHandler, {'path': './static/'}),
    (r'/setup_complete', index.SetupHandler),
    (r'/i/(\w+)', index.InterviewHandler),
    (r'/i/(\w+)/socket', interview.InterviewHandler),
    ], **settings)


def assets_built():
    return os.path.exists("static/akobi.css")

def main():
    if not assets_built():
        print "Akobi CSS isn't built!"
        print "Run 'fab build_assets' before starting the app"
        sys.exit(1)

    http_server = HTTPServer(app)
    http_server.listen(8888)
    IOLoop.instance().start()


if __name__ == '__main__':
    main()

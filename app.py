import os
import subprocess

from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.web import Application, StaticFileHandler

from akobi.handlers import interview, index, auth

settings = {
    'auto_reload': True,
    'debug': True,
    'template_path': os.path.join(os.path.dirname(__file__), 'templates')
}

app = Application([
    (r'/', index.IndexHandler),
    (r'/auth', auth.AuthHandler),
    (r'/authrefactor', auth.AuthHandlerRefactor),
    (r'/i/(\w+)', interview.InterviewHTTPHandler),
    (r'/i/(\w+)/socket', interview.InterviewWebSocketHandler),
    (r'/setup_complete', index.SetupHandler),
    (r'/static/(.*)', StaticFileHandler, {'path': './static/'}),
    (r'/test', index.TestHandler),
    ], **settings)


def build_assets():
    cmd = ['fab', 'local', 'build']
    subprocess.call(cmd)


def main():
    print "Building assets"
    # build_assets()

    print "Running server"
    http_server = HTTPServer(app)
    http_server.listen(8888)
    IOLoop.instance().start()


if __name__ == '__main__':
    main()

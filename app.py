import os
import subprocess
import sys

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
    (r'/i/(\w+)', interview.InterviewHTTPHandler),
    (r'/i/(\w+)/socket', interview.InterviewWebSocketHandler),
    (r'/static/(.*)', StaticFileHandler, {'path': './static/'}),
    ], **settings)


def build_assets():
    cmd = ['fab', 'local', 'build']
    subprocess.call(cmd)


def main():
    if len(sys.argv) < 2:
        print "No port specified for server. Defaulting to 8888"
        port = 8888
    else:
        port = int(sys.argv[1])

    print "Running server on port %d" % port
    http_server = HTTPServer(app)
    http_server.listen(port)
    IOLoop.instance().start()


if __name__ == '__main__':
    main()

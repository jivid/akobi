from tornado.web import RequestHandler


class IndexHandler(RequestHandler):
    def get(self):
        self.render('../templates/index.html')
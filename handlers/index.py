from tornado.web import RequestHandler


class IndexHandler(RequestHandler):
    def get(self, *args, **kwargs):
        self.render('../templates/index.html')
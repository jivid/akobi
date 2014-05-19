from tornado.web import RequestHandler


class CollabEditHandler(RequestHandler):
    def get(self, *args, **kwargs):
        self.render('../templates/collabEdit.html')
from tornado.web import RequestHandler


class InterviewHandler(RequestHandler):
    def get(self, *args, **kwargs):
        self.render('../templates/interview.html')


class IndexHandler(RequestHandler):
    def get(self, *args, **kwargs):
        self.render('../templates/index.html')


class SetupHandler(RequestHandler):
    def get(self, *args, **kwargs):
        try:
            notes = self.get_query_argument('notes')
        except:
            notes = "off"
        try:
            collab_code = self.get_query_argument('collab_code')
        except:
            collab_code = "off"
        self.render(
            '../templates/setup_complete.html',
             notes=notes, collab_code=collab_code)
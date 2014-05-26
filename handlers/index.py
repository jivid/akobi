import string
import random
from tornado.web import RequestHandler


class InterviewHandler(RequestHandler):
    def get(self, *args, **kwargs):
        self.render('../templates/interview.html')


class IndexHandler(RequestHandler):
    def get(self, *args, **kwargs):
        self.render('../templates/index.html')


class SetupHandler(RequestHandler):
    def get(self, *args, **kwargs):

        # HTML checkboxes pass nothing if they are unchecked.
        notes = self.get_query_argument('notes', default="off")
        collab_code = self.get_query_argument('collab_code', default="off")

        # TODO: We should probably do this more like a product serial than
        # just a random id.
        interview_id_list = [random.choice(
            string.ascii_letters + string.digits) for n in xrange(30)]
        interview_id = "".join(interview_id_list)

        # Currently the notes /  collab_code variables are just displayed back
        # to the user, and not used for anything.
        self.render(
            '../templates/setup_complete.html',
             notes=notes, collab_code=collab_code, interview_id=interview_id)
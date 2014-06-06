from tornado.web import RequestHandler

from akobi.lib.utils import make_random_string
from akobi.lib.applications.registry import registry

def isUserApplication(application_name):
        return application_name != "Heartbeat"

applications = filter(isUserApplication, registry.available)

class InterviewHandler(RequestHandler):
    def get(self, *args, **kwargs):
        self.render(
            '../templates/interview.html', applications=self.request.arguments)


class IndexHandler(RequestHandler):
    def get(self, *args, **kwargs):
        self.render('../templates/index.html', applications=applications)


class SetupHandler(RequestHandler):
    def get(self, *args, **kwargs):

        # HTML checkboxes pass nothing if they are unchecked.
        application_state = {}

        for application in applications:
            application_state[application] = self.get_query_argument(
                application, default="off")

        # TODO: We should probably do this more like a product serial than
        # just a random id.
        interview_id = make_random_string(length=30)

        self.render(
            '../templates/setup_complete.html',
            interview_id = interview_id,
            application_state = application_state)
from tornado.web import RequestHandler

from akobi import log

from akobi.lib.utils import make_random_string
from akobi.lib.applications.registry import registry
from akobi.lib.redis_client import redis_client


applications = registry.available.keys()
applications.remove("Heartbeat")


class InterviewHandler(RequestHandler):
    def get(self, *args, **kwargs):
        self.render(
            '../templates/interview.html', applications=self.request.arguments)


class IndexHandler(RequestHandler):
    def get(self, *args, **kwargs):
        self.render('../templates/index.html', applications=applications)


class SetupHandler(RequestHandler):
    def get(self, *args, **kwargs):

        # HTML checkboxes pass nothing if they are unchecked.1
        application_state = {}
        interviewer_email = self.get_query_argument('interviewer_email',
                                                    default="off")
        interviewee_email = self.get_query_argument('interviewee_email',
                                                    default="off")

        for application in applications:
            if self.get_query_argument(application, None):
                application_state[application] = self.get_query_argument(
                    application)

        redis = redis_client.get_redis_instance()

        # TODO: We should probably do this more like a product serial than
        # just a random id.
        interview_id = make_random_string(length=30)

        redis.hset("interview:%s" % interview_id, "interviewer_email",
                   interviewer_email)
        redis.hset("interview:%s" % interview_id, "interviewee_email",
                   interviewee_email)
        self.render(
            '../templates/setup_complete.html',
            interview_id=interview_id,
            application_state=application_state)

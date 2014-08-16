from tornado.web import RequestHandler

from akobi import log
from akobi.lib.applications.registry import registry
from akobi.lib.redis_client import redis_client
from akobi.lib.utils import make_random_string


applications = registry.available.keys()
applications.remove("Heartbeat")


class IndexHandler(RequestHandler):
    def get(self, *args, **kwargs):
        self.render('index.html', applications=applications)


class SetupHandler(RequestHandler):
    def get(self, *args, **kwargs):

        # HTML checkboxes pass nothing if they are unchecked
        application_state = {}
        interviewer = self.get_query_argument('interviewer_email')
        interviewee = self.get_query_argument('interviewee_email')

        for application in applications:
            if self.get_query_argument(application, None):
                application_state[application] = self.get_query_argument(
                    application)

        # TODO: We should probably do this more like a product serial than
        # just a random id.
        interview_id = make_random_string()

        redis = redis_client.get_redis_instance()
        interview_key = "interview:%s" % (interview_id)
        log.info("Setting interviewer email")
        redis.hset(interview_key, "interviewer_email", interviewer)
        log.info("Setting interviewee email")
        redis.hset(interview_key, "interviewee_email", interviewee)

        self.render(
            'setup_complete.html',
            interview_id=interview_id,
            application_state=application_state)

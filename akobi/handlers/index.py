from tornado.web import RequestHandler

from akobi import log
from akobi.lib.applications.registry import registry
from akobi.lib.redis_client import redis_client
from akobi.lib.utils import make_random_string


applications = registry.available.keys()
applications.remove("Heartbeat")


class InterviewHandler(RequestHandler):
    def _redirect_to_auth(self, interview_id):
        auth_url = "/auth?for=%s" % interview_id
        self.redirect(auth_url)

    def get(self, interview_id, *args, **kwargs):
        if not "_sessionid" in self.cookies:
            self._redirect_to_auth(interview_id)
            return

        # See if there is a valid, active session for this interview
        session_cookie = self.get_cookie("_sessionid")
        if not session_cookie.startswith(interview_id + "$"):
            self._redirect_to_auth(interview_id)
            return

        # Verify that we have the same session ID in the db
        redis = redis_client.get_redis_instance()
        session_id = session_cookie.split("$")[1]
        session_key = "session:%s" % session_id
        interview_val = redis.get(session_key)
        if not interview_val == interview_id:
            self._redirect_to_auth(interview_id)
            return

        # Finally allow the user through to the interview
        self.render('interview.html', applications=self.request.arguments)


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

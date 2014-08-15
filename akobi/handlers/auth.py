import time

from tornado.web import RequestHandler

from akobi import log
from akobi.lib.redis_client import redis_client
from akobi.lib.utils import make_random_string


class AuthHandler(RequestHandler):
    def get(self):
        self.render("auth.html")

    def _send_error(self, msg):
        self.set_status(500)
        self.write({
            'error': msg
        })

    def post(self):
        interview = self.get_query_argument("for", None)
        if interview is None:
            raise NotImplementedError

        email = self.get_body_argument("email", None)
        if email is None:
            log.error("No email sent")
            self._send_error("Invalid Email")
            return

        redis = redis_client.get_redis_instance()
        interview_key = "interview:%s" % interview

        interviewer = redis.hget(interview_key, "interviewer_email")
        interviewee = redis.hget(interview_key, "interviewee_email")
        if not email == interviewer and not email == interviewee:
            log.error("Email doesn't validate")
            self._send_error("Invalid Email")
            return

        log.info("Email validation successful")
        session_id = make_random_string()

        # Store the session ID in redis
        session_key = "session:%s" % session_id
        redis.set(session_key, interview)
        redis.expire(session_key, 60)

        cookie = "%s$%s" % (interview, session_id)
        expiry = time.time() + 60  # One hour from now
        self.set_cookie('_sessionid', cookie, expires=expiry)

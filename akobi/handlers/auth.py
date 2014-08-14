import time

from tornado.web import RequestHandler

from akobi import log
from akobi.lib.redis_client import redis_client


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

        time.sleep(2)
        redis = redis_client.get_redis_instance()
        interview = "interview:%s" % interview

        interviewer = redis.hget(interview, "interviewer_email")
        interviewee = redis.hget(interview, "interviewee_email")
        if not email == interviewer and not email == interviewee:
            log.error("Email doesn't validate")
            self._send_error("Invalid Email")
            return

        log.info("Email validation successful")

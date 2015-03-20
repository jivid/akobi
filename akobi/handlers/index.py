from tornado.web import RequestHandler

from akobi.lib.applications.registry import registry
from akobi.lib.redis_client import redis_client
from akobi.lib.utils import function_as_callback, \
    make_random_string, send_email


applications = registry.available.keys()
applications.remove("Heartbeat")


class IndexHandler(RequestHandler):

    def _get_and_store(self, interview_id, arg_key):
        redis = redis_client.get_redis_instance()
        interview_key = "interview:%s" % interview_id

        arg_value = self.get_argument(arg_key)
        redis.hset(interview_key, arg_key, arg_value)

        return arg_value

    def get(self, *args, **kwargs):
        self.render('index.html')

    def post(self, *args, **kwargs):
        interview_id = make_random_string()

        interviewer = self._get_and_store(interview_id, 'interviewer_email')
        interviewee = self._get_and_store(interview_id, 'interviewee_email')

        self._get_and_store(interview_id, 'interviewer_name')
        self._get_and_store(interview_id, 'interviewee_name')

        interview_link = "http://akobi.info/i/%s" % interview_id

        body = ("You've created an Akobi Interview!\n\n"
                "Here's the link: %s" % (interview_link))
        function_as_callback(send_email, interviewer, body)

        body = ("You've been invited to an Akobi Interview!\n\n"
                "Here's the link: %s" % (interview_link))
        function_as_callback(send_email, interviewee, body)

        self.write({'interviewID': interview_id})

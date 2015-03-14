from tornado.web import RequestHandler

from akobi import log
from akobi.lib.applications.registry import registry
from akobi.lib.redis_client import redis_client
from akobi.lib.utils import make_random_string


applications = registry.available.keys()
applications.remove("Heartbeat")


class IndexHandler(RequestHandler):
    def _store_arg_in_redis(self, interview_id, arg_key):
        redis = redis_client.get_redis_instance()
        interview_key = "interview:%s" % interview_id

        arg_value = self.get_argument(arg_key)
        redis.hset(interview_key, arg_key, arg_value)

    def get(self, *args, **kwargs):
        self.render('index.html')

    def post(self, *args, **kwargs):
        interview_id = make_random_string()

        self._store_arg_in_redis(interview_id, 'interviewer_email')
        self._store_arg_in_redis(interview_id, 'interviewer_name')
        self._store_arg_in_redis(interview_id, 'interviewee_email')
        self._store_arg_in_redis(interview_id, 'interviewee_name')

        self.write({'interviewID': interview_id})


from akobi import log
from akobi.lib import utils
from akobi.lib.applications.registry import registry
from akobi.lib.applications.base import BaseApplication
from akobi.lib.redis_client import redis_client


class NotesApplication(BaseApplication):

    def handle_message(self, message, interviews, *args, **kwargs):
        interview_id = message['interviewID']
        client_id = message['clientID']
        redis = redis_client.get_redis_instance()
        redis.hset("notes", client_id, message['data'])
        log.debug(redis.hget("notes", client_id))


registry.register("Notes", NotesApplication)

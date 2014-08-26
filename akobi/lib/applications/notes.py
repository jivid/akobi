from akobi import log
from akobi.lib.applications.base import BaseApplication
from akobi.lib.applications.registry import registry
from akobi.lib.redis_client import redis_client


class NotesApplication(BaseApplication):
    def on_join(self, *args, **kwargs):
        log.info("on_join for notes application called.")

    def handle_message(self, message, *args, **kwargs):
        client_id = message['clientID']
        redis = redis_client.get_redis_instance()
        redis.hset("notes", client_id, message['data']['note'])
        log.debug(redis.hget("notes", client_id))

    def on_client_leave(self, *args, **kwargs):
        log.info("on_client_leave for notes application called.")

registry.register("Notes", NotesApplication)

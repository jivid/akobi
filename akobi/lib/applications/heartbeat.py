from akobi import log
from akobi.lib.applications.registry import registry
from akobi.lib.applications.base import BaseApplication
from akobi.lib.redis_client import redis_client


class HeartbeatApplication(BaseApplication):
    essential = True

    def handle_message(self, message, interviews, *args, **kwargs):
        interview_id = message['interviewID']
        client_id = message['clientID']
        redis = redis_client.get_redis_instance()

        if interview_id not in interviews:
            log.error("Could not find interview ID %s" % (interview_id))
            return

        sockets = interviews[interview_id]

        expected_client_id = lambda socket: socket.client_id == client_id
        if not filter(expected_client_id, sockets):
            log.error("No client with id %s in interview with id %s"
                      % (client_id, interview_id))

        redis.hset("heartbeat", client_id, message['datetime'])
        log.debug(redis.hget("heartbeat", client_id))

    def on_client_leave(self, *args, **kwargs):
        log.info("on_client_leave for heartbeat")

registry.register("Heartbeat", HeartbeatApplication)

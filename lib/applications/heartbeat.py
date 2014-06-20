import logging
import datetime
import json

from akobi import log
from akobi.lib import utils
from akobi.lib.applications.registry import registry
from akobi.lib.applications.base import BaseApplication
from akobi.lib.redis_client import redis_client


class HeartbeatApplication(BaseApplication):

    essential = True

    def handle_message(self, message, interviews, *args, **kwargs):
        log.debug("Got Heartbeat")
        interview_id = message['interviewID']
        client_id = message['clientID']
        redis = redis_client.get_redis_instance()
        log.debug(
            "Got Heartbeat for interview '%s' and client '%s'"
            % (interview_id, client_id))

        if interview_id not in interviews:
            log.error("Could not find interview ID '%s'" % (interview_id))
            return

        sockets = interviews[interview_id]

        found = False
        for socket in sockets:
            if not hasattr(socket, 'client_id'):
                log.error("Socket in interview '%s' has no client ID"
                          % (interview_id))
            if str(socket.client_id) == client_id:
                socket.write_message(utils.create_message("heartbeat_response",
                                     client_id, interview_id))
                found = True
        if not found:
            log.error("No client with id '%s' in interview with id '%s'"
                      % (client_id, interview_id))

        redis.hset("heartbeat", client_id, message['datetime'])
        log.debug(redis.hget("heartbeat", client_id))

registry.register("Heartbeat", HeartbeatApplication)

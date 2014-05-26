import logging

from akobi.lib.event_handlers.registry import registry
from akobi.lib.event_handlers.base import BaseEventHandler
from akobi.lib.redis_client import redis_client
from akobi.lib import utils


class HeartbeatHandler(BaseEventHandler):

    def handle(self, message, interviews, *args, **kwargs):
        interview_id = message['interviewID']
        client_id = message['clientID']
        redis = redis_client.get_redis_instance()
        logging.debug(
            "Got Heartbeat for interview '%s' and client '%s'"
            % (interview_id, client_id))

        if not interview_id in interviews:
            logging.error("Could not find interview ID '%s'" % (interview_id))
            return

        sockets = interviews[interview_id]

        found = False
        for socket in sockets:
            if not hasattr(socket, 'client_id'):
                logging.error("Socket in interview '%s' has no client ID"
                              % (interview_id))
            if str(socket.client_id) == client_id:
                socket.write_message(utils.create_message("heartbeat_response",
                                     client_id, interview_id))
                found = True
        if not found:
            logging.error("No client with id '%s' in interview with id '%s'"
                          % (client_id, interview_id))

        redis.hset("heartbeat", client_id, message['datetime'])
        logging.debug(redis.hget("heartbeat", client_id))

registry.register("Heartbeat", HeartbeatHandler)

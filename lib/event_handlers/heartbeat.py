import logging
import datetime
import json

from akobi.lib.event_handlers.registry import registry
from akobi.lib.event_handlers.base import BaseEventHandler
from akobi.lib.redis_client import redis_client


class HeartbeatHandler(BaseEventHandler):

    def handle(self, message, interviews, *args, **kwargs):
        interview_id = message['interviewID']
        client_id = message['clientID']
        redis = redis_client.get_redis_instance()
        logging.debug(
            'Got Heartbeat for interview "%s" and client "%s"'
            % (interview_id, client_id))

        response = {'datetime': str(datetime.datetime.now()),
                    'type': 'heartbeat_response',
                    'clientID': client_id,
                    'interviewID': interview_id,
                    'data': {}
                    }
        try:
            sockets = interviews[interview_id]
        except KeyError, e:
            logging.error('Could not find interview ID - reason "%s"' % str(e))

        found = False
        for socket in sockets:
            if not hasattr(socket, 'client_id'):
                logging.error('Socket in interview "%s" has no client ID'
                              % (interview_id))
            if str(socket.client_id) == client_id:
                socket.write_message(json.dumps(response))
                found = True
        if not found:
            logging.error('No client with id "%s" in interview with id "%s"'
                          % (client_id, interview_id))

        redis.hset("heartbeat", client_id, message['datetime'])
        logging.debug(redis.hget("heartbeat", client_id))

registry.register("Heartbeat", HeartbeatHandler)

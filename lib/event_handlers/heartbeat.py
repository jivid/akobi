import logging
import datetime
import json

from akobi.lib.event_handlers.registry import registry
from akobi.lib.event_handlers.base import BaseEventHandler
from akobi.lib.redis_client import redis_client


class HeartbeatHandler(BaseEventHandler):

    def handle(self, message, interviews, *args, **kwargs):
        interview_id = message["interviewID"]
        client_id = message["clientID"]
        redis = redis_client.get_redis_instance()
        logging.info(
            "Got Heartbeat for interview '" + interview_id +
            "' and client '" + client_id + "'")

        response = {'datetime': str(datetime.datetime.now()),
                    'type': "heartbeat_response",
                    'clientID': client_id,
                    'interviewID': interview_id,
                    'data': 'Heartbeat Successful'
                    }
        sockets = interviews[interview_id]
        found = False
        for socket in sockets:
            if str(socket.client_id) == client_id:
                socket.write_message(json.dumps(response))
                found = True
        if not found:
            logging.error('Could not find client with id ' + client_id
                          + ' in interview with id ' + interview_id)

        redis.hset("heartbeat", client_id, message['datetime'])
        logging.info(redis.hget("heartbeat", client_id))

registry.register("Heartbeat", HeartbeatHandler)

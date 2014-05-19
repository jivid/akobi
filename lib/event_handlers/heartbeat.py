from akobi.lib.event_handlers.registry import registry
from akobi.lib.event_handlers.base import BaseEventHandler

from akobi.lib.redis_client import redis_client


class HeartbeatHandler(BaseEventHandler):

    def handle(self, message, interviews, *args, **kwargs):
        interview_id = message["interviewID"]
        client_id = message["clientID"]
        redis = redis_client.get_redis_instance()
        #print(
        #    "Got Heartbeat for interview '" + interview_id +
        #    "' and client '" + client_id + "'")

        sockets = interviews[interview_id]
        for socket in sockets:
            if socket.client_id == client_id:
                socket.write_message("Heartbeat Successful")

        redis.hset("heartbeat", client_id, message['datetime'])
        print(redis.hget("heartbeat", client_id))

    #def find_offline_participants(self, conns):
    #    offline_participants = set()
    #    for conn in conns:
    #        if ((datetime.datetime.now() - conn.lastHeartbeat) > 60000):
    #            offline_participants.add(conn)
    #    return offline_participants

registry.register("Heartbeat", HeartbeatHandler)

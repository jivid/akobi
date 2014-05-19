from lib.event_handlers.registry import registry
from lib.event_handlers.base import BaseEventHandler


class HeartbeatHandler(BaseEventHandler):
    def handle(self, message):
        print("Got Heartbeat")

registry.register("Heartbeat", HeartbeatHandler)

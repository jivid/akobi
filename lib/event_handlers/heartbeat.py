from akobi.lib.event_handlers.registry import registry
from akobi.lib.event_handlers.base import BaseEventHandler


class HeartbeatHandler(BaseEventHandler):
    def handle(self, message, interviews):
        print(
            "Got Heartbeat for interview:" + message["interviewID"])

registry.register("Heartbeat", HeartbeatHandler)

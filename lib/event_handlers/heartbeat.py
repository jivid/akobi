from akobi.lib.event_handler.registry import registry
from akobi.lib.event_handler.base import BaseEventHandler


class HeartbeatHandler(BaseEventHandler):
    def handle(self, message):
        pass

registry.register("HeartbeatHandler", HeartbeatHandler)

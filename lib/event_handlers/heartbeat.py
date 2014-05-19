from akobi.lib.event_handlers.registry import registry
from akobi.lib.event_handlers.base import BaseEventHandler
from akobi.lib import log


class HeartbeatHandler(BaseEventHandler):

    def handle(self, message, *args, **kwargs):
        print("Got Heartbeat")

registry.register("Heartbeat", HeartbeatHandler)

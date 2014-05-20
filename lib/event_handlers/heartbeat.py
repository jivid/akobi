from akobi.lib.event_handlers.registry import registry
from akobi.lib.event_handlers.base import BaseEventHandler
import logging


class HeartbeatHandler(BaseEventHandler):

    def handle(self, message, *args, **kwargs):
        logging.info("Got Heartbeat")

registry.register("Heartbeat", HeartbeatHandler)

import logging
from akobi.lib.applications.registry import registry
from akobi.lib.applications.base import BaseApplication


class Heartbeat(BaseApplication):

    def handle_message(self, message, *args, **kwargs):
        logging.info("Got Heartbeat")

registry.register("Heartbeat", Heartbeat)

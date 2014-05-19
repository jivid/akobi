from akobi.lib.event_handlers.registry import registry
from akobi.lib.event_handlers.base import BaseEventHandler
from akobi.lib import log


class HeartbeatHandler(BaseEventHandler):
    def handle(self, message, interviews):
        log.info_log(
            'Got Heartbeat for interview:' + message["interviewID"])

registry.register("Heartbeat", HeartbeatHandler)
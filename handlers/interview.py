import json
from tornado.websocket import WebSocketHandler
from akobi.lib import utils
from akobi.lib.event_handlers.registry import registry
from akobi.lib.event_handlers import heartbeat
from akobi.lib import log


class InterviewHandler(WebSocketHandler):

    ongoing_interviews = {}

    def open(self, interview_id):
        log.info_log(
            'Web socket connection opened with interview_id %s' % interview_id)
        if interview_id not in InterviewHandler.ongoing_interviews:
            InterviewHandler.ongoing_interviews[interview_id] = set()

        InterviewHandler.ongoing_interviews[interview_id].add(self)

    def on_message(self, message):
        log.info_log('Received from web socket: %s' % str(message))
        message = json.loads(message)
        handler = registry.find(utils.message_type_to_handler(message["type"]))
        handler().handle(
            message, InterviewHandler.ongoing_interviews)

    def on_close(self):
        log.info_log('Web socket connection closed.')


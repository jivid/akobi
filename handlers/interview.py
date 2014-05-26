import json
import uuid

from tornado.websocket import WebSocketHandler
from akobi import log
from akobi.lib import utils
from akobi.lib.event_handlers.registry import registry
from akobi.lib.event_handlers import heartbeat


class InterviewHandler(WebSocketHandler):

    ongoing_interviews = {}

    def open(self, interview_id):
        log.debug(
            "Web socket connection opened with interview_id %s" % interview_id)
        if interview_id not in InterviewHandler.ongoing_interviews:
            InterviewHandler.ongoing_interviews[interview_id] = set()

        self.client_id = uuid.uuid4()
        self.write_message(utils.create_message("open_response",
                           str(self.client_id), interview_id))
        InterviewHandler.ongoing_interviews[interview_id].add(self)

    def on_message(self, message):
        message = json.loads(message)
        log.debug("Received message from web socket. InterviewID %s" %
                  message['interviewID'])
        handler = registry.find(utils.message_type_to_handler(message['type']))
        handler().handle(
            message, InterviewHandler.ongoing_interviews)

    def on_close(self):
        log.debug("Web socket connection closed.")

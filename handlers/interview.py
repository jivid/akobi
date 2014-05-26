import datetime
import json
import uuid

from tornado.websocket import WebSocketHandler
from akobi import log
from akobi.lib import utils
from akobi.lib.applications.registry import registry
from akobi.lib.applications import heartbeat


class InterviewHandler(WebSocketHandler):

    ongoing_interviews = {}

    def open(self, interview_id):
        log.debug(
            "Web socket connection opened with interview_id %s" % interview_id)
        if interview_id not in InterviewHandler.ongoing_interviews:
            InterviewHandler.ongoing_interviews[interview_id] = set()

        self.client_id = uuid.uuid4()
        response = {'datetime': str(datetime.datetime.now()),
                    'type': "open_response",
                    'clientID': str(self.client_id),
                    'interviewID': interview_id,
                    'data': {}
                    }
        self.write_message(json.dumps(response))
        InterviewHandler.ongoing_interviews[interview_id].add(self)

    def on_message(self, message):
        message = json.loads(message)
        log.debug("Received message from web socket. InterviewID %s" %
                  message['interviewID'])
        application = registry.find(message['interviewID'],
            utils.message_type_to_application_name(message["type"]))
        application().handle_message(
            message, InterviewHandler.ongoing_interviews)

    def on_close(self):
        log.debug("Web socket connection closed.")

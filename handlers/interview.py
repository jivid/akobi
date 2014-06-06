import json
import uuid

from tornado.websocket import WebSocketHandler

from akobi import log
from akobi.lib import utils
from akobi.lib.applications.registry import registry
from akobi.lib.applications.heartbeat import HeartbeatApplication
from akobi.lib.initializer import Initializer
from akobi.lib.interviews import ongoing_interviews
from akobi.lib.applications import notes


class InterviewHandler(WebSocketHandler):

    def __init__(self, *args, **kwargs):
        super(InterviewHandler, self).__init__(*args, **kwargs)
        self.client_id = None
        self.interview_id = None

    def open(self, interview_id):
        log.debug(
            "Web socket connection opened with interview_id %s" % interview_id)
        if interview_id not in ongoing_interviews:
            ongoing_interviews[interview_id] = set()

        if self.client_id is None:
            self.client_id = utils.make_random_string(length=30)

        if self.interview_id is None:
            self.interview_id = interview_id

        self.write_message(utils.create_message("open_response",
                           self.client_id, self.interview_id))
        ongoing_interviews[interview_id].add(self)

    def on_message(self, message):
        message = json.loads(message)
        log.debug("Received message from web socket. InterviewID %s" %
                  message['interviewID'])

        if message['type'] == "init_interview":
            log.debug("Initializing interview for client %s on interview %s"
                      % (self.client_id, self.interview_id))
            Initializer.initialize(message['interviewID'], self)

            '''
            TODO: Register application to interview on selection screen.
            '''
            registry.register_to_interview(self.interview_id, "Heartbeat")
            registry.register_to_interview(self.interview_id, "Notes")

            registry.init_interview(message['interviewID'])
            return

        application = registry.find(message['interviewID'],
                                    utils.message_type_to_application_name(
                                    message["type"]));

        application.handle_message(message, ongoing_interviews)

    def on_close(self):
        log.debug("Web socket connection closed.")

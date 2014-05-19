import json
from tornado.websocket import WebSocketHandler
from akobi.lib import utils
from akobi.lib.event_handlers.registry import registry
from akobi.lib.event_handlers import heartbeat


class InterviewHandler(WebSocketHandler):

    ongoing_interviews = {}

    def open(self, interview_id):
        print "Web socket connection opened. with interview_id " + interview_id
        if interview_id not in InterviewHandler.ongoing_interviews:
            InterviewHandler.ongoing_interviews[interview_id] = set()

        InterviewHandler.ongoing_interviews[interview_id].add(self)
        
    def on_message(self, message):
        print "Received from web socket: %s" % str(message)
        message = json.loads(message)
        handler = registry.find(utils.message_type_to_handler(message["type"]))
        handler().handle(
            message, InterviewHandler.ongoing_interviews)

    def on_close(self):
        print(u"Web socket connection closed.")
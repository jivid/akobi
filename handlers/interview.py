import json
from tornado.websocket import WebSocketHandler
from akobi.lib import utils
from akobi.lib.event_handlers.registry import registry
from akobi.lib.event_handlers import heartbeat


class InterviewHandler(WebSocketHandler):

    def open(self):
        print "Web socket connection opened."
        
    def on_message(self, message):
        print "Received from web socket: %s" % str(message)
        message = json.loads(message)
        handler = registry.find(utils.message_type_to_handler(message["type"]))
        handler().handle(message)

    def on_close(self):
        print(u"Web socket connection closed.")
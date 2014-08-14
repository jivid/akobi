import json

from tornado.websocket import WebSocketHandler

# We need to import all the applications in here so that they get regsitered
from akobi import log
from akobi.lib import utils
from akobi.lib.applications import heartbeat, collabedit, notes, video
from akobi.lib.applications.registry import registry
from akobi.lib.initializer import Initializer
from akobi.lib.interviews import ongoing_interviews
from akobi.lib.redis_client import redis_client


class InterviewHandler(WebSocketHandler):
    def __init__(self, *args, **kwargs):
        super(InterviewHandler, self).__init__(*args, **kwargs)
        self.client_id = None
        self.interview_id = None
        self.interview_initialized = False

    def write_message(self, msg, *args, **kwargs):
        """ Thin wrapper around write_message to dump a dict to string before
            sending down to the client
        """
        if type(msg) is dict:
            msg = json.dumps(msg)

        super(InterviewHandler, self).write_message(msg)

    def open(self, interview_id):
        log.debug("WebSocket opened for interview %s" % interview_id)

        if interview_id not in ongoing_interviews:
            ongoing_interviews[interview_id] = set()

        if self.client_id is None:
            self.client_id = utils.make_random_string()

        if self.interview_id is None:
            self.interview_id = interview_id

        msg = utils.create_message(msg_type='open_response',
                                   client=self.client_id,
                                   interview=self.interview_id)
        self.write_message(msg)
        ongoing_interviews[interview_id].add(self)

    def on_message(self, message):
        msg = json.loads(message)

        if msg['type'] == "init_interview":
            log.debug("Initializing interview for client %s on interview %s"
                      % (self.client_id, self.interview_id))

            Initializer.initialize(msg['interviewID'], self)
            self.interview_initialized = True
            return

        elif msg['type'] == "download_apps":
            # TODO: Register application to interview on selection screen
            registry.register_to_interview(self.interview_id, "Heartbeat")
            registry.register_to_interview(self.interview_id, "Notes")
            registry.register_to_interview(self.interview_id, "Collabedit")
            registry.register_to_interview(self.interview_id, "Video")

            apps = registry.app_names_for_interview(self.interview_id)
            message = utils.create_message(msg_type="download_apps",
                                           client=self.client_id,
                                           interview=self.interview_id,
                                           applications=apps)
            self.write_message(message)
            return

        if self.interview_initialized is True:
            app = utils.message_type_to_application_name(msg['type'])
            application = registry.find(msg['interviewID'], app)
            application.handle_message(msg, ongoing_interviews)

    def on_close(self):
        print self.request.headers
        live_apps = registry.apps_for_interview(self.interview_id)
        if live_apps is None:
            return

        for app_name in live_apps:
            utils.function_as_callback(live_apps[app_name].on_client_leave,
                                       self)
        log.info("Web socket connection closed.")

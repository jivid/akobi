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

        elif msg['type'] == "auth":
            interview_id = msg['interviewID']
            if not interview_id == self.interview_id:
                log.error("Incorrect interview ID passed. Expected %s got %s"
                          % (self.interview_id, interview_id))
                return

            email = msg['data']['email']
            log.debug("Attempting auth on email %s for interview %s"
                      % (email, interview_id))

            redis = redis_client.get_redis_instance()
            interview = "interview:%s" % interview_id
            interviewer_email = redis.hget(interview, "interviewer_email")
            interviewee_email = redis.hget(interview, "interviewee_email")

            message = utils.create_message(msg_type="auth_response",
                                           client=msg['clientID'],
                                           interview=self.interview_id,
                                           success=0)

            if not email == interviewer_email or\
                    not email == interviewee_email:
                self.write_message(message)

            message['data']['success'] = 1

            # TODO: Register application to interview on selection screen
            registry.register_to_interview(self.interview_id, "Heartbeat")
            registry.register_to_interview(self.interview_id, "Notes")
            registry.register_to_interview(self.interview_id, "Collabedit")
            registry.register_to_interview(self.interview_id, "Video")

            apps = registry.app_names_for_interview(self.interview_id)
            message['data']['applications'] = apps

            if email == interviewer_email:
                message['data']['role'] = "interviewer"
                self.write_message(message)
            elif email == interviewee_email:
                message['data']['role'] = "interviewee"
                self.write_message(message)

            return

        if self.interview_initialized is True:
            app = utils.app_name_from_msg(msg)
            application = registry.find(msg['interviewID'], app)
            application.handle_message(msg, ongoing_interviews)

    def on_close(self):
        live_apps = registry.apps_for_interview(self.interview_id)
        for app_name in live_apps:
            utils.function_as_callback(live_apps[app_name].on_client_leave,
                                       self)
        log.info("Web socket connection closed.")

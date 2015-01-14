import json

from tornado.web import RequestHandler
from tornado.websocket import WebSocketHandler

# We need to import all the applications in here so that they get regsitered
from akobi import log
from akobi.lib import utils
from akobi.lib.applications import heartbeat, collabedit, notes, video
from akobi.lib.applications.registry import registry
from akobi.lib.initializer import Initializer
from akobi.lib.interviews import ongoing_interviews
from akobi.lib.redis_client import redis_client


class InterviewHTTPHandler(RequestHandler):
    def _redirect_to_auth(self, interview_id):
        auth_url = "/auth?for=%s" % interview_id
        self.redirect(auth_url)

    def get(self, interview_id, *args, **kwargs):
        if not "_sessionid" in self.cookies:
            self._redirect_to_auth(interview_id)
            return

        # See if there is a valid, active session for this interview
        session_cookie = self.get_cookie("_sessionid")
        if not session_cookie.startswith(interview_id + "$"):
            self._redirect_to_auth(interview_id)
            return

        # Verify that we have the same session ID in the db
        redis = redis_client.get_redis_instance()
        session_id = session_cookie.split("$")[1]
        session_key = "session:%s" % session_id
        interview_val = redis.get(session_key)
        if not interview_val == interview_id:
            self._redirect_to_auth(interview_id)
            return

        # Finally allow the user through to the interview
        self.render('interview.html', applications=self.request.arguments)

"""
1. Socket opens, server responds with open_response
2. client gets open response sends download_apps message sent to server
3. list of apps for interview sent down to client
4. client downloads JS source for every app
5. init_interview is sent to the server
6. server initializes interview and all apps
7. interview begins like normal
"""
class InterviewWebSocketHandler(WebSocketHandler):
    def __init__(self, *args, **kwargs):
        super(InterviewWebSocketHandler, self).__init__(*args, **kwargs)
        self.client_id = None
        self.interview_id = None
        self.interview_initialized = False

    def write_message(self, msg, *args, **kwargs):
        """ Thin wrapper around write_message to dump a dict to string before
            sending down to the client
        """
        if type(msg) is dict:
            msg = json.dumps(msg)

        super(InterviewWebSocketHandler, self).write_message(msg)

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
            app = utils.app_name_from_msg(msg)
            application = registry.find(msg['interviewID'], app)
            application.handle_message(msg, ongoing_interviews)

    def on_close(self):
        live_apps = registry.apps_for_interview(self.interview_id)
        if live_apps is None:
            return

        for app_name in live_apps:
            utils.function_as_callback(live_apps[app_name].on_client_leave,
                                       self)
        log.info("Web socket connection closed.")

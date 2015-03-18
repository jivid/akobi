from akobi import log
from akobi.lib.applications.base import BaseApplication
from akobi.lib.applications.registry import registry
from akobi.lib.redis_client import redis_client
from akobi.lib.utils import function_as_callback, send_email


class NotesApplication(BaseApplication):
    def on_join(self, *args, **kwargs):
        log.info("on_join for notes application called.")

    def handle_message(self, message, *args, **kwargs):
        log.info(message)
        client_id = message['clientID']
        redis = redis_client.get_redis_instance()
        redis.hset("notes", client_id, message['data']['note'])
        log.debug(redis.hget("notes", client_id))

    def on_client_leave(self, socket, *args, **kwargs):
        log.info("on_client_leave for notes application called.")

        interview_id = kwargs['interview_id']
        interview_key = "interview:%s" % interview_id

        role = kwargs['role']
        client_id = kwargs['client_id']

        redis = redis_client.get_redis_instance()

        # If you're an interviewer role is '0'
        # If you're an interviewee role is '1'
        hkey = 'interviewer_email' if role == '0' else 'interviewee_email'
        email = redis.hget(interview_key, hkey)
        log.debug("Sending notes email for %s" % email)

        body = ("Thanks for interviewing with Akobi!\n\n"
                "Here's your notes:\n\n%s" %
                redis.hget("notes", client_id))

        function_as_callback(send_email, email, body)

registry.register("Notes", NotesApplication)

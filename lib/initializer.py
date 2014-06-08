from tornado import gen

from akobi import log
from akobi.lib.applications.registry import registry
from akobi.lib.interviews import ongoing_interviews
from akobi.lib.utils import function_as_callback


class Initializer(object):
    """
    Initialize the interview for a particular client. Called by the
    WebSocketHandler's on_message method when it receives an init
    message from the client (which happens whenever a new client joins)
    """

    @classmethod
    def initialize(cls, interview_id, client_socket):
        # There's no need to re-check if the client belongs to the interview
        # here. We assume that this is already done in the RequestHandler that
        # receives the client's email ID for the first time. Just go ahead
        # and add the socket to ongoing_interviews here
        log.debug("Added client %s to ongoing interviews" %
                  client_socket.client_id)
        ongoing_interviews[interview_id].add(client_socket)

        # TODO: Figure out whether or not I want to gen.Tasks here
        cls._instantiate_for_interview(interview_id)

        cls.notify_apps_client_joined(interview_id, client_socket)

    @staticmethod
    def _instantiate_for_interview(interview_id):
        registry.init_interview(interview_id)

    @staticmethod
    def notify_apps_client_joined(interview_id, client_socket):
        # Find apps from registry and call their on_joins as callbacks
        apps = registry.apps_for_interview(interview_id)

        for app_name in apps:
            log.debug("Pulled application out of apps_for_interview %s" %
                      app_name)
            instance = apps[app_name]
            function_as_callback(instance.on_join, client_socket)

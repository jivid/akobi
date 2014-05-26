class Initializer(object):
    """
    Initialize the interview for a particular client. Called by the
    WebSocketHandler's on_message method when it receives an init
    message from the client (which happens whenever a new client joins)
    """

    _apps_instantiated = False

    @classmethod
    def initialize(cls, interview_id, client_id):
        if not cls._apps_instantiated:
            cls._instantiate_for_interview(interview_id)

        cls._setup_apps(interview_id)
        pass

    @staticmethod
    def _instantiate_for_interview(interview_id):
        pass

    @staticmethod
    def _setup_apps(interview_id);
        pass

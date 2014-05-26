from akobi import log
from akobi.lib.applications.base import BaseApplication

__all__ = ('registry',)


class ApplicationRegistry(object):
    """
    Event handler registry that is global to the application. Uses the Borg
    design pattern (bit.ly/1oxVQNI) to maintain a global list of handlers.
    """

    __shared_state = {
        "available": {},
        "interviews": {},
    }

    def __init__(self):
        self.__dict__ = self.__shared_state

    def register(self, name, application):
        if not issubclass(application, BaseApplication):
            raise TypeError("App doesn't subclass BaseApplication")

        self.available[name] = application

    def register_to_interview(self, interview_id, app_name):
        if interview_id not in self.interviews:
            self._add_interview(interview_id)

        self.interviews[interview_id][app_name] = None

    def _add_interview(self, interview_id):
        self.interviews[interview_id] = {}

    def apps_for_interview(self, interview_id):
        if interview_id not in self.interviews:
            return None

        return self.interviews[interview_id]

    def init_interview(self, interview_id):
        if interview_id not in self.interviews:
            raise KeyError("Interview id has not been added to registry")

        for app_name in self.interviews[interview_id]:
            self._create_app_instance(interview_id, app_name)

    def _create_app_instance(self, interview_id, app_name):
        app_instance = self.available[app_name]()
        self.interviews[interview_id][app_name] = app_instance
        log.info("Added app %s to interview %s" % interview_id, app_name)

    def find(self, interview_id, app_name):
        if interview_id not in self.interviews:
            raise KeyError("Interview id is not present in the registry")

        if app_name not in self.interviews[interview_id]:
            raise KeyError("Application name is not present in the registry")

        if self.interviews[interview_id][app_name] is None:
            raise TypeError("Application is not instantiated")

        return self.interviewss[interview_id][app_name]


registry = ApplicationRegistry()

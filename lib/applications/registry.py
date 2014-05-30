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
        """
        Register the application in the 'available' dict. After this point,
        the application will be available for adding to specific interviews.
        We only allow an application name to be registered once. Re-using an
        already used name will result in a TypeError
        """
        if not issubclass(application, BaseApplication):
            raise TypeError("%s isn't a descendent of BaseApplication!"
                            % application)

        if name in self.available:
            raise TypeError("There is already an application registered with "
                            "the name %s!" % name)

        self.available[name] = application

    def register_to_interview(self, interview_id, app_name):
        if interview_id not in self.interviews:
            self._add_interview(interview_id)

        self.interviews[interview_id][app_name] = None

    def apps_for_interview(self, interview_id):
        if interview_id not in self.interviews:
            return None
        
        return self.interviews[interview_id]
        
    def _add_interview(self, interview_id):
        self.interviews[interview_id] = {}

    def init_interview(self, interview_id):
        if interview_id not in self.interviews:
            raise KeyError("Interview ID has not been added to registry")

        for app_name in self.interviews[interview_id]:
            self._create_app_instance(interview_id, app_name)

    def _create_app_instance(self, interview_id, app_name):
        app_instance = self.available[app_name]()
        self.interviews[interview_id][app_name] = app_instance

    def find(self, interview_id, app_name):
        if interview_id not in self.interviews:
            raise KeyError("Interview ID is not present in the registry")

        if app_name not in self.interviews[interview_id]:
            raise KeyError("Application name is not present in the registry")

        if self.interviews[interview_id][app_name] is None:
            raise TypeError("Application is not instantiated")

        return self.interviews[interview_id][app_name]


registry = ApplicationRegistry()

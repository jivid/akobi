from akobi import log
from akobi.lib.applications.base import BaseApplication

__all__ = ('registry',)


class ApplicationRegistry(object):
    """
    Application registry that keeps track of all available applications as
    well as applications registered to currently running interviews. Only one
    instance of this registry exists per instance of the Akobi application, so
    to maintain correct state, we use the Borg design pattern (bit.ly/1oxVQNI)

    Within the registry, an interview moves through a total of 3 states:
        1. Added - The registry is aware that the interview exists, but has
                   no applications registered to it.

        2. Apps Registered - The interview now has some applications registered
                             to it, but they haven't been instantiated yet.

        3. Apps Instantiated - All apps registered to the interview are now
                               instantiated and can be freely used.

    """

    __non_essential_apps = []

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

        if app_name in self.interviews[interview_id]:
            log.debug("Application %s already registered to %s." %
                      (app_name, interview_id))
            return

        log.debug("Setting %s in %s to none." % (app_name, interview_id))
        self.interviews[interview_id][app_name] = None

    def non_essential_apps(self):
        if not self.__non_essential_apps:
            for key in self.available:
                if (self.available[key]._essential is False):
                    self.__non_essential_apps.append(self.available[key])
        return self.__non_essential_apps

    def apps_for_interview(self, interview_id):
        return self.interviews[interview_id]\
            if interview_id in self.interviews else None

    def _add_interview(self, interview_id):
        self.interviews[interview_id] = {}

    def init_interview(self, interview_id):
        if interview_id not in self.interviews:
            self._add_interview(interview_id)

        interview_apps = self.apps_for_interview(interview_id)
        for app_name in interview_apps:
            # Under no circumstance should we re-instatiate apps, doing so can
            # make them to lose state. Since the interview initializer is
            # called everytime a client connects, we move this logic into
            # the registry so the initializer can be left stateless
            if self.interviews[interview_id][app_name] is not None:
                continue

            log.info("Instantiating %s for interview %s" % (app_name,
                     interview_id))
            self._create_app_instance(interview_id, app_name)

    def _create_app_instance(self, interview_id, app_name):
        app_instance = self.available[app_name]()
        self.interviews[interview_id][app_name] = app_instance

    def find(self, interview_id, app_name):
        if interview_id not in self.interviews:
            raise KeyError("Interview ID %s not present in the registry" %
                           interview_id)

        if app_name not in self.interviews[interview_id]:
            raise KeyError("%s is not present in the registry" % app_name)

        if self.interviews[interview_id][app_name] is None:
            raise TypeError("%s is not instantiated for interview"
                            % app_name, interview_id)

        return self.interviews[interview_id][app_name]


registry = ApplicationRegistry()

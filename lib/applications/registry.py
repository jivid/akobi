from akobi import log

__all__ = ('registry',)


class ApplicationRegistry(object):
    """
    Event handler registry that is global to the application. Uses the Borg
    design pattern (bit.ly/1oxVQNI) to maintain a global list of handlers.
    """

    __shared_state = {
        "applications": {}
    }

    def __init__(self):
        self.__dict__ = self.__shared_state

    def register(self, name, application):
        self.applications[name] = application

    def find(self, application_name):
        if application_name in self.applications:
            application = self.applications[application_name]
        else:
            log.error(
                "Tried to find unregistered application: %s"
                % (application_name))
            raise KeyError()

        return application

registry = ApplicationRegistry()

from akobi import log
from akobi.lib.applications.registry import registry
from akobi.lib.applications.base import BaseApplication
from akobi.lib import utils


class VideoApplication(BaseApplication):
    SET_CALLER = 1

    def __init__(self):
        self.sockets = []

    def on_join(self, socket, *args, **kwargs):
        self.sockets.append(socket)
        log.info("on_join for video application called.")

        # Once two clients have joined set one of them as the caller.
        if len(self.sockets) == 2:
            data = {"type": VideoApplication.SET_CALLER, "data": {"isCaller"
                                                                  : True}}
            message = utils.create_message("video", "", "", **data)
            self.sockets[0].write_message(message)

            data = {"type": VideoApplication.SET_CALLER, "data": {"isCaller"
                                                                  : False}}
            message = utils.create_message("video", "", "", **data)
            self.sockets[1].write_message(message)

    def handle_message(self, message, interviews, *args, **kwargs):
        log.info("video got message" + str(message))
        for socket in self.sockets:
            if socket.client_id != message['clientID']:
                socket.write_message(message)

    def on_client_leave(self, socket, *args, **kwargs):
        self.sockets.remove(socket)


registry.register("Video", VideoApplication)

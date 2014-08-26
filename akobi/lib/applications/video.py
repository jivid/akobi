from akobi import log
from akobi.lib import utils
from akobi.lib.applications.base import BaseApplication
from akobi.lib.applications.registry import registry


class VideoApplication(BaseApplication):
    SET_CALLER = 1

    def __init__(self):
        self.sockets = []

    def on_join(self, socket, *args, **kwargs):
        if len(self.sockets) == 2:
            log.error("More than two people connected to video")
            return

        self.sockets.append(socket)

        # Once two clients have joined set one of them as the caller.
        if len(self.sockets) == 2:
            data = {
                "type": VideoApplication.SET_CALLER,
                "data": {
                    "isCaller": True
                }
            }
            message = utils.create_message(msg_type="video",
                                           client=socket.client_id,
                                           interview=socket.interview_id,
                                           **data)
            self.sockets[1].write_message(message)

            message['data']['data']['isCaller'] = False
            self.sockets[0].write_message(message)

    def handle_message(self, message, *args, **kwargs):
        for socket in self.sockets:
            if socket.client_id != message['clientID']:
                socket.write_message(message)

    def on_client_leave(self, socket, *args, **kwargs):
        self.sockets.remove(socket)


registry.register("Video", VideoApplication)

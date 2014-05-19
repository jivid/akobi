import time

from tornado import gen
from tornado.ioloop import IOLoop

from akobi.lib.event_handlers.base import BaseEventHandler
from akobi.lib.event_handlers.registry import registry
from akobi.lib.utils import async_handle


class TimedMessageHandler(BaseEventHandler):
    @gen.engine
    def handle(self, iters, delay, *args, **kwargs):
        for i in range(iters):
            print("Going to come back up in %d seconds" % delay)
            yield gen.Task(IOLoop.instance().add_timeout, time.time() + delay)
            print("[%s] I'm back after %d seconds" % (str(time.time()), delay))

        IOLoop.instance().add_callback(IOLoop.instance().stop)

registry.register("TimedMessageHandler", TimedMessageHandler)

timed = registry.find("TimedMessageHandler")()
timed_new = registry.find("TimedMessageHandler")()

async_handle(timed, 6, 5)
async_handle(timed_new, 3, 10)

IOLoop.instance().start()
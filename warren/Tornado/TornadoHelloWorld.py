'''
Hello world example from tornado website.
'''

import tornado.ioloop;
import tornado.web;

'''
Class MainHandler, inherits from tornado.web.RequestHandler
'''
class MainHandler(tornado.web.RequestHandler):
	def get(self):
		self.write("Hello, world")

'''
Variable application, created using tornado.web.Application.
Registers MainHandler as callback for requests?
'''
application = tornado.web.Application([
	(r"/", MainHandler),
]);

'''
Kicks up application, unsure of where __name__ is coming from.
'''
if __name__ == "__main__":
	application.listen(8888)
	tornado.ioloop.IOLoop.instance().start()


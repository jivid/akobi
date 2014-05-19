class InterviewMemberHandler(websocket.WebSocketHandler):
    """
    Handles incoming client connections on the websocket. This will run
    on a separate port from the normal InterviewHandler, as well as have
    its own URL path
    """
    def open(self):
        self.id = uuid.uuid4()
        self.write_message(self.id)

    def on_message(self, message):
        msg = json.loads(message)
        if msg['type'] == types.NEW_CONNECTION:
            email = msg['data']['email']
            recvd_id = msg['data']['id']
            namespace = msg['data']['namespace']

            # Extra security measure
            if not recvd_id == self.id:
                self.write_message("Could not add you to the interview")
                return

            # add_to_interview should check if the email is expected in the
            # namespace. If so, redis.sadd the email to the interview, if not
            # send back an error to the client with the error. this method
            # will probably also just end up calling a generic add_to_namespace
            # function where the namespace id is the interview id/hash
            success = InterviewHandler.add_to_interview(namespace, email)

            if success:
                self.write_message("Connection successful!")
            else:
                self.write_message("Could not add you to the interview")

        elif msg['type'] == types.EDITOR_KEYPRESS:
            # do something with the new keypress. probably want to add it to
            # a buffer so that other clients connected to the namespace can
            # receive it
            pass

        return

handlers = [
    (r'/i/(?P<hash>)[A-Za-z0-9]+', InterviewHandler),
    (r'/i/(?P<hash>)[A-Za-z0-9]+/member/new', InterviewMemberHandler)
]

def message_type_to_handler(message_type):
    words = message_type.split('_')
    handler = "".join([w.title() for w in words])
    return handler

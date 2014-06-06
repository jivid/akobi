''' Dictionary mapping currently ongoing interviews to the clients
    connected on that interview. The map is of format:
    interview_id: [
        client1_websocket_instance
        client2_websocket_instance
    ]
'''
ongoing_interviews = {}

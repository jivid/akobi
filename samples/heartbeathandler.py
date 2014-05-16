import datetime


class HeartbeatHandler():
    def handle(self, socket):
        # TODO: write heartbeat time and # of heartbeats to Redis
        socket.write_message("Heartbeat Successful")

    #def findOfflineParticipants(self, conns):
    #    offlineParticipants = set()
    #    for conn in conns:
    #        if ((datetime.datetime.now() - conn.lastHeartbeat) > 60000):
    #            offlineParticipants.add(conn)
    #    return offlineParticipants

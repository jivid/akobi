function sendMessage(type, clientID, interviewID, socket, data){
	socket.send(JSON.stringify({
          datetime: new Date(),
          type: type,
          clientID: clientID,
          interviewID: interviewID,
          data : data
      }))
}
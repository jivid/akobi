function isValidJson(data){

    if (jQuery.isEmptyObject(data)) {
        return true;
    }

	try {
        JSON.parse(data);
    } catch (e) {
        return false;
    }
    return true;
}

function sendMessage(type, clientID, interviewID, socket, data){
	if (!isValidJson(data)){
		console.log("sendMessage invoked with invalid json data:\n" + data);
		return false;
	}
	socket.send(JSON.stringify({
          datetime: new Date(),
          type: type,
          clientID: clientID,
          interviewID: interviewID,
          data : data
      }))
}

define(["videoadapter"], function(videoAdapter) {

    var SET_CALLER = 1;
    var SIGNALLING = 2;

    var pc_config = {
      'iceServers': [
        {
          'url': 'stun:stun.l.google.com:19302'
        },
        {
          'url': 'turn:192.158.29.39:3478?transport=udp',
          'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          'username': '28224511:1379330808'
        },
        {
          'url': 'turn:192.158.29.39:3478?transport=tcp',
          'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          'username': '28224511:1379330808'
        }
      ]
    }


    var localVideo;
    var remoteVideo;
    var localStream;
    var remoteStream;
    var pc;

    var errorCallback = function(error){
        console.log(error.toString());
    }

    var waitForPC = function(callback, arg){
        if(pc == undefined){
            setTimeout(function(){
                waitForPC(callback, arg);
            }, 1000);
        }else{
            callback(arg);
        }
    }

    var createOffer = function(){
        pc.createOffer(setLocalAndSend, errorCallback);
    }

    var respondToOffer = function(offer){
        console.log(offer);
        pc.setRemoteDescription(new RTCSessionDescription(offer), function(){
             pc.createAnswer(setLocalAndSend, errorCallback)
        }, errorCallback);
    }

    var addIceCandidate = function(candidate){
        pc.addIceCandidate(candidate);
    }

    var setLocalAndSend = function(sessionDescription){
        pc.setLocalDescription(sessionDescription);
        interview.socket.send({
            type: 'video',
            clientID: interview.client.id,
            interviewID: interview.id,
            data: {
                type: SIGNALLING,
                data: { sessionDescription : sessionDescription}
            }
        });
    }

    EventBus.on("video", function(msg) {
        console.log(msg.data);
        switch (msg.data.type){
            case SET_CALLER:
                if(msg.data.data.isCaller){
                    waitForPC(createOffer);
                }
                break;
            case SIGNALLING:
                if (msg.data.data.sessionDescription){
                    if (msg.data.data.sessionDescription.type == "offer"){
                        waitForPC(respondToOffer, msg.data.data.sessionDescription);
                    } else if (msg.data.data.sessionDescription.type == "answer"){
                        pc.setRemoteDescription(new RTCSessionDescription
                        (msg.data.data.sessionDescription));
                    }
                }
                else if (msg.data.data.type == "candidate"){
                    var candidate = new RTCIceCandidate({sdpMLineIndex : msg
                    .data.data.label, candidate : msg.data.data.candidate,
                    sdpMid : msg.data.data.id});
                    waitForPC(addIceCandidate, candidate);
                }
                break;
        }
    });

    videoAdapter.getUserMedia(
        {video: true, audio : false}, $.proxy(function(localMediaStream){
           localStream = localMediaStream;
           localVideo= $('#local_video');
           remoteVideo= $('#remote_video');
           localVideo.attr("src", window.URL
                .createObjectURL(localMediaStream));
           pc = new videoAdapter.RTCPeerConnection(pc_config);

           pc.addStream(localStream);

           pc.onaddstream = function(event){
                remoteVideo.attr("src", window.URL.createObjectURL(event
                .stream));
                remoteStream = event.stream
           };

           pc.onicecandidate = function(event){
            if (event.candidate){
                interview.socket.send({
                    type: 'video',
                    clientID: interview.client.id,
                    interviewID: interview.id,
                    data: {
                        type: SIGNALLING,
                        data: { type : "candidate", label : event.candidate
                        .sdpMLineIndex, id: event.candidate.sdpMid, candidate
                         : event.candidate.candidate}
                    }
                });
            }
           }

        }, this), errorCallback);

});


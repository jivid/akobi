define(["videoadapter"], function(videoAdapter) {

    var SET_CALLER = 1;
    var SIGNALLING = 2;

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
                if (msg.data.data.sessionDescription.type == "offer"){
                    waitForPC(respondToOffer, msg.data.data.sessionDescription);
                } else if (msg.data.data.sessionDescription.type == "answer"){
                    pc.setRemoteDescription(new RTCSessionDescription
                    (msg.data.data.sessionDescription));
                }
                break;
        }
    });

    videoAdapter.getUserMedia(
        {video: true, audio : true}, $.proxy(function(localMediaStream){
           localStream = localMediaStream;
           localVideo= $('#local_video');
           remoteVideo= $('#remote_video');
           localVideo.attr("src", window.URL
                .createObjectURL(localMediaStream));
           pc = new videoAdapter.RTCPeerConnection(null);

           pc.addStream(localStream);

           pc.onaddstream = function(event){
                remoteVideo.attr("src", window.URL.createObjectURL(event
                .stream));
                remoteStream = event.stream
           };
        }, this), errorCallback);

});


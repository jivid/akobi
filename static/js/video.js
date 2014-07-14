// README FIRST http://www.html5rocks.com/en/tutorials/webrtc/basics/

define(["ext/videoadapter", "util"], function(videoAdapter, util) {

    var SET_CALLER = 1;
    var SIGNALLING = 2;

    var pc_config = {
      'iceServers': [
        {
          'url': 'stun:stun.l.google.com:19302'
        }
      ]
    }

    var localVideo;
    var remoteVideo;
    var localStream;
    var remoteStream;
    var pc;


    var errorCallback = function(error) {
        util.throwException(error);
    }

    var waitForPC = function(callback) {
        if(pc == undefined){
            setTimeout(function(){
                waitForPC(callback);
            }, 1000);
        }else{
            callback();
        }
    }

    var waitForMediaStream = function(callback) {
        if(localStream == undefined){
            setTimeout(function(){
                waitForMediaStream(callback);
            }, 1000);
        }else{
            callback();
        }
    }

    var createOffer = function() {
        pc.createOffer(setLocalAndSend, errorCallback);
    }

    var respondToOffer = function(offer) {
        pc.setRemoteDescription(new RTCSessionDescription(offer), function(){
             pc.createAnswer(setLocalAndSend, errorCallback)
        }, errorCallback);
    }

    var addIceCandidate = function(candidate) {
        pc.addIceCandidate(candidate);
    }

    var setLocalAndSend = function(sessionDescription) {
        pc.setLocalDescription(sessionDescription, function(){}, errorCallback);
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
        switch (msg.data.type){
            case SET_CALLER:
                if(msg.data.data.isCaller){
                    initialize(createOffer);
                }
                break;
            case SIGNALLING:
                if (msg.data.data.sessionDescription){
                    if (msg.data.data.sessionDescription.type == "offer"){
                        initialize(function(){
                            respondToOffer(msg.data.data.sessionDescription);
                        });
                    } else if (msg.data.data.sessionDescription.type == "answer"){
                        pc.setRemoteDescription(new RTCSessionDescription
                        (msg.data.data.sessionDescription), function(){},
                        errorCallback);
                    }
                }
                else if (msg.data.data.type == "candidate"){
                    var candidate = new RTCIceCandidate({sdpMLineIndex : msg
                    .data.data.label, candidate : msg.data.data.candidate,
                    sdpMid : msg.data.data.id});
                    waitForPC(function(){
                        addIceCandidate(candidate);
                    });
                }
                break;
        }
    });

    var createPC = function() {
        pc = new videoAdapter.RTCPeerConnection(pc_config);
        pc.addStream(localStream);


        pc.onaddstream = function(event) {
            remoteVideo.attr("src", window.URL.createObjectURL(event
            .stream));
            remoteStream = event.stream
        };

        pc.onicecandidate = function(event) {
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
    }

    var getLocalStream = function() {
        videoAdapter.getUserMedia( {video: true, audio : true}, function
        (localMediaStream){
            localStream = localMediaStream;
            localVideo= $('#local_video');
            remoteVideo= $('#remote_video');
            localVideo.attr("src", window.URL.createObjectURL(localMediaStream));
        }, errorCallback);
    }

    var initialize = function(callback) {
        waitForMediaStream(function() {
                createPC();
                callback();
        });
    }

    getLocalStream();
});


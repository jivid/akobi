/** @jsx React.DOM **/
define(["common", "ext/videoadapter", "util"], function(common, videoAdapter, util) {
    var setupVideo = function() {
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

        var errorCallback = function(error){
            util.throwException(error);
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
                        var candidate = new RTCIceCandidate({
                            sdpMLineIndex: msg.data.data.label,
                            candidate: msg.data.data.candidate,
                            sdpMid: msg.data.data.id
                        });
                        console.log(candidate);
                        waitForPC(addIceCandidate, candidate);
                    }
                    break;
            }
        });

        window.videoAdapter = videoAdapter;
        videoAdapter.getUserMedia(
            {video: true, audio : true}, $.proxy(function(localMediaStream) {
                localStream = localMediaStream;
                localVideo = $('#local-video');
                localVideo.attr("src", window.URL.createObjectURL(localMediaStream));
                pc = new videoAdapter.RTCPeerConnection(pc_config);

                pc.addStream(localStream);

                remoteVideo = $('#remote-video2');
                pc.onaddstream = function(event) {
                    console.log("Adding remote stream");
                    console.log(remoteVideo);
                    remoteVideo.attr("src", window.URL.createObjectURL(event.stream));
                    remoteStream = event.stream
                };

                pc.onicecandidate = function(event) {
                    if (event.candidate) {
                        interview.socket.send({
                            type: 'video',
                            clientID: interview.client.id,
                            interviewID: interview.id,
                            data: {
                                type: SIGNALLING,
                                data: {
                                    type : "candidate",
                                    label : event.candidate.sdpMLineIndex,
                                    id: event.candidate.sdpMid,
                                    candidate: event.candidate.candidate
                                }
                            }
                        });
                    }
                }
            }, this), errorCallback);
    };

    var VideoSpace = React.createClass({
        render: function() {
            return (
                <div id="video-container">
                    <video id="local-video" autoPlay="true" muted="true"></video>
                    <video id="remote-video2" autoPlay="true"></video>
                </div>
            )
        }
    });

    var VideoView = common.AkobiApplicationView.extend({
        initialize: function() {
            this.render();
            setupVideo();
        },

        render: function() {
            React.renderComponent(<VideoSpace />, this.$el.get(0));
            this.$el.addClass("container-med pull-left");
            $('#video-space').append(this.$el);
        }
    });

    window.setupVideo = setupVideo;
    new VideoView();
});


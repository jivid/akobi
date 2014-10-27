/** @jsx React.DOM **/
/*
Peer 2 Peer video is implemented using the WEBRTC standard. Please see
the below link for information on ICE clients Peer connections etc.
README FIRST http://www.html5rocks.com/en/tutorials/webrtc/basics/
*/
var videoAdapter = require ("./ext/videoadapter");
var util = require ("./util");
var React = require("react/addons");

require("./eventbus")();

class Video {
  constructor(interview, localVideo, remoteVideo) {
    this.pc_config = {
        'iceServers': [
          { 'url': 'stun:stun.l.google.com:19302'}
        ]
    };

    this.msg_types = {
      SET_CALLER: 1,
      SIGNALLING: 2,
    };

    this.interview = interview;
    this.localVideo = localVideo;
    this.remoteVideo = remoteVideo;
    this.pc = undefined;
    this.localStream = undefined;
    this.remoteStream = undefined;

    EventBus.on("video", (msg) => {
      console.log(msg);
      switch (msg.data.type){
        case this.msg_types.SET_CALLER:
          if(msg.data.data.isCaller){
            this.initialize(this.createOffer);
          }
          break;
        case this.msg_types.SIGNALLING:
          if (msg.data.data.sessionDescription){
            if (msg.data.data.sessionDescription.type == "offer") {
              this.initialize(() => {
                this.respondToOffer(msg.data.data.sessionDescription);
              });
            } else if (msg.data.data.sessionDescription.type == "answer") {
              this.pc.setRemoteDescription(
                  new RTCSessionDescription(msg.data.data.sessionDescription),
                   function(){}, this.errorCallback);
            }
          }
          else if (msg.data.data.type == "candidate") {
            var candidate = new RTCIceCandidate(
              {
                sdpMLineIndex : msg.data.data.label,
                candidate : msg.data.data.candidate,
                sdpMid : msg.data.data.id
              });
            this.waitForPC(() => {
              this.addIceCandidate(candidate);
            });
          }
          break;
      }
    });
    this.getLocalStream();
  };

  errorCallback(error) {
    util.throwException(error);
  };

  waitForPC(callback) {
    if(this.pc === undefined){
      setTimeout(() => {
          this.waitForPC(callback);
      }, 200);
    }else{
      callback();
    }
  };

  waitForMediaStream(callback) {
    if(this.localStream === undefined){
      setTimeout(() => {
          this.waitForMediaStream(callback);
      }, 200);
    } else{
      callback();
    }
  };

  createOffer() {
    console.log("creating offer");
    this.pc.createOffer(this.setLocalAndSend.bind(this),
      this.errorCallback.bind(this));
  };

  respondToOffer(offer) {
    console.log("responding to offer");
    this.pc.setRemoteDescription(new RTCSessionDescription(offer), () => {
      this.pc.createAnswer(this.setLocalAndSend.bind(this), this.errorCallback.bind(this));
    }, this.errorCallback);
  };

  addIceCandidate(candidate) {
    this.pc.addIceCandidate(candidate);
  };

  setLocalAndSend(sessionDescription) {
    console.log("setLocalAndSend");
    this.pc.setLocalDescription(sessionDescription, function(){}, this.errorCallback);
    this.interview.socket.send({
      type: 'video',
      clientID: this.interview.client_id,
      interviewID: this.interview.id,
      data: {
        type: this.msg_types.SIGNALLING,
        data: { sessionDescription : sessionDescription}
      }
    });
  };

  createPC() {
    console.log("creating pc")
    this.pc = new videoAdapter.RTCPeerConnection(this.pc_config);
    this.pc.addStream(this.localStream);

    this.pc.onaddstream = (event) => {
      console.log("stream added");
      this.remoteVideo.getDOMNode().setAttribute("src", window.URL.createObjectURL(event.stream));
      this.remoteStream = event.stream;
    };

    this.pc.onicecandidate = (event) => {
      console.log("ice candidate");
      if (event.candidate) {
        this.interview.socket.send({
          type: 'video',
          clientID: this.interview.client_id,
          interviewID: this.interview.id,
          data: {
            type: this.msg_types.SIGNALLING,
            data: {
              type: "candidate",
              label : event.candidate.sdpMLineIndex,
              id: event.candidate.sdpMid,
              candidate: event.candidate.candidate
            }
          }
        });
      }
    };

    console.log(this.pc);
  };

  getLocalStream() {
    videoAdapter.getUserMedia( {video: true, audio : true}, (localMediaStream) => {
        this.localStream = localMediaStream;
        this.localVideo.getDOMNode().setAttribute("src", window.URL.createObjectURL(localMediaStream));
    }, this.errorCallback);
  };

  initialize(callback) {
    this.waitForMediaStream( () => {
      this.createPC();
      callback.bind(this)();
    });
  };
}

var VideoSpace = React.createClass({
  componentDidMount: function() {
    var video = new Video(this.props.interview, this.refs.localVideo, this.refs.remoteVideo);
  },

  render: function() {
    return (
      <div id="video-container">
        <video id="local-video" ref="localVideo" autoPlay="true" muted="true"></video>
        <video id="remote-video" ref="remoteVideo" autoPlay="true"></video>
      </div>
    );
  }
});

module.exports = VideoSpace;
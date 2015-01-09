/** @jsx React.DOM **/
/*
Peer 2 Peer video is implemented using the WEBRTC standard. Please see
the below link for information on ICE clients Peer connections etc.
README FIRST http://www.html5rocks.com/en/tutorials/webrtc/basics/
*/
var videoAdapter = require ("../../ext/videoadapter");
var util = require ("./lib/Utils");
var React = require("react/addons");
var EventBus = require("./lib/EventBus");

class VideoLogic {
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
    this.pc.createOffer(this.setLocalAndSend.bind(this),
      this.errorCallback.bind(this));
  };

  respondToOffer(offer) {
    this.pc.setRemoteDescription(new RTCSessionDescription(offer), () => {
      this.pc.createAnswer(this.setLocalAndSend.bind(this), this.errorCallback.bind(this));
    }, this.errorCallback);
  };

  addIceCandidate(candidate) {
    this.pc.addIceCandidate(candidate);
  };

  setLocalAndSend(sessionDescription) {
    this.pc.setLocalDescription(sessionDescription, function(){}, this.errorCallback);
    this.interview.socket.send({
      type: 'video',
      clientID: this.interview.clientID,
      interviewID: this.interview.id,
      data: {
        type: this.msg_types.SIGNALLING,
        data: { sessionDescription : sessionDescription}
      }
    });
  };

  createPC() {
    this.pc = new videoAdapter.RTCPeerConnection(this.pc_config);
    this.pc.addStream(this.localStream);

    this.pc.onaddstream = (event) => {
      this.remoteVideo.getDOMNode().setAttribute("src", window.URL.createObjectURL(event.stream));
      this.remoteStream = event.stream;
    };

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.interview.socket.send({
          type: 'video',
          clientID: this.interview.clientID,
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

var Video = React.createClass({
  componentDidMount: function() {
    var videoLogic = new VideoLogic(this.props.interview, this.refs.localVideo, this.refs.remoteVideo);
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

module.exports = Video
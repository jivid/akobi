var EventBus = require('./lib/EventBus');
var AkobiWebSocket = require('./AkobiWebSocket');

class Interview {
  constructor(id, onAppsDownloaded) {
    this.id = id;
    this.clientID = null;
    this.socket = new AkobiWebSocket();

    this.socket.on('message', (msg) => {
      if (msg.type === 'open_response') {
        this.interviewerName = msg.data.interviewerName;
        this.intervieweeName = msg.data.intervieweeName;
        this.clientID = msg.clientID;
        this.downloadApps(onAppsDownloaded);
      } else {
        EventBus.trigger(msg.type, msg);
      }
    });
  }

  downloadApps(callback) {
    EventBus.on('download_apps', (msg) => {
      var apps = [];
      msg.data.applications.forEach((app) => {
        apps.push(app.toLowerCase());
      });
      this.apps = apps;
      callback(apps);
    });

    this.socket.send({
      type: 'download_apps',
      clientID: this.clientID,
      interviewID: this.id,
    });
  }
}

module.exports = Interview;
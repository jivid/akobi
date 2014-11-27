var EventBus = require('./EventBus');
var Socket = require('./Socket');

class Interview {
  constructor(id, onAppsDownloaded) {
    this.id = id;
    this.clientID = null;
    this.socket = new Socket();

    this.socket.on('open', (msg) => {
      this.downloadApps(onAppsDownloaded);
    });

    this.socket.on('message', (msg) => {
      if (msg.type === 'open_response') {
        this.clientID = msg.clientID;
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
      clientID: '',
      interviewID: this.id,
    });
  }
}

module.exports = Interview;
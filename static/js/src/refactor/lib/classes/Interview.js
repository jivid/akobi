var EventBus = require('./EventBus');
var Socket = require('./Socket');

class Interview {
  constructor(id) {
    this.id = id;
    this.clientID = null;
    this.socket = {type: 'Socket'};

    this.socket.on('message', (msg) => {
      if (msg.type === 'open_response') {
        this.clientID = msg.clientID;
      } else {
        EventBus.trigger(msg);
      }
    });
  }

  downloadApps(callback) {
    EventBus.on('download_apps', (msg) => {
      var apps = [];
      msg.data.applications.forEach((app) => {
        apps.push(app.toLowerCase()
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
var _ = require('underscore');
var Backbone = require('backbone');

if (!window.EventBus) {
  var EventBus = {};
  _.extend(EventBus, Backbone.Events);
  window.EventBus = EventBus;
}

module.exports = window.EventBus;
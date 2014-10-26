var Backbone = require("backbone");
var _ = require("underscore");

module.exports = function() {
	if (window.EventBus === undefined) {
    	window.EventBus = {};
    	_.extend(EventBus, Backbone.Events);
	}
}
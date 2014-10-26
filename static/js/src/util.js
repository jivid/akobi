var $ = require("jquery");

var util = {
    isValidJSON: function(data) {
        return $.isPlainObject(data);
    },
    throwException: function(message) {
        throw {
            name     : "Akobi Error",
            message  : message,
            toString : function(){return this.name + ": " + this.message;}
        }
    },
    validateMessageContents: function(message) {
        if (message.type === undefined) {
            throwException("Missing message type");
        }

        if (message.clientID === undefined) {
            throwException("Missing clientID on message");
        }

        var interviewID = window.location.pathname.split('/')[2];
        if (message.interviewID != interviewID) {
            throwException("interviewID mismatch on message");
        }
    }

}

module.exports = util;


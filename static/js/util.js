define(function() {
    function isValidJSON(data){
        return $.isPlainObject(data);
    }

    function throwException(message) {
        throw {
            name     : "Akobi Error",
            message  : message,
            toString : function(){return this.name + ": " + this.message;}
        }
    }

    function validateMessageContents(msg) {
        if (msg.type === undefined) {
            throwException("Missing message type");
        }

        if (msg.clientID === undefined) {
            throwException("Missing clientID on message");
        }

        var interviewID = window.location.pathname.split('/')[2];
        if (msg.interviewID != interviewID) {
            throwException("interviewID mismatch on message");
        }
    }

    return {
        isValidJSON: isValidJSON,
        throwException: throwException,
        validateMessageContents: validateMessageContents
    };
});

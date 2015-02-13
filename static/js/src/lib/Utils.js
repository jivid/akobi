var Utils = {
  throwException: function(message) {
    throw {
        name     : "Akobi Error",
        message  : message,
        toString : function(){return this.name + ": " + this.message;}
    }
  },
  capitalizeFirstLetter: function(word) {
    if (!word) {
      return null;
    }

    return word.charAt(0).toUpperCase() + word.slice(1);
  },
};

module.exports = Utils;
var Http = require('http')
  , Logger = require('log4js')
  , Q = require('q')
  ;

// Export it
module.exports = HttpRequest;

function HttpRequest(options) {
  this.logger = Logger.getLogger("HttpRequest");
  this.options = options;
};

HttpRequest.prototype.get = function() {
  var self = this;
  var deferred = Q.defer();

  this.logger.debug("Requesting resource via http: " + JSON.stringify(this.options));
  
  Http
    .get(
      this.options, 
      function(res) {
        if (res.statusCode != 200) {
          self.logger.warn("Resource request failed. Request returned status " + res.statusCode + " but expected 200!");
          deferred.reject();
          
          return;
        }
        
        var body = '';

        res.on(
          "data",
          function(x) {
            body += x;
          });

        res.on(
          "end",
          function() {
            self.logger.debug("Resource request succeeded.");
            deferred.resolve(body);
          });
      })
    .on(
      "error",
      function(e) {
        self.logger.warn("Resource request failed. Error was: " + e.message);
        deferred.reject();
      });
  
  return deferred.promise;
};

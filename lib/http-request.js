var Http = require('http')
  , LoggerDecorator = require('./logger-decorator')
  , Q = require('q')
  ;

// Export it
module.exports = HttpRequest;

function HttpRequest(options, $logger) {
  if (typeof $logger !== 'object')
    throw "logger is undefined, null or not an object";

  var logger = new LoggerDecorator($logger, "ninja-dusk-till-dawn (http request)");
  var self = this;
  
  this.get = function() {
    var deferred = Q.defer();

    logger.debug("Requesting resource via http: " + JSON.stringify(options));
    
    Http
      .get(
        options, 
        function(res) {
          if (res.statusCode != 200) {
            logger.warn("Resource request failed. Request returned status " + res.statusCode + " but expected 200!");
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
              logger.debug("Resource request succeeded.");
              deferred.resolve(body);
            });
        })
      .on(
        "error",
        function(e) {
          logger.warn("Resource request failed. Error was: " + e.message);
          deferred.reject();
        });
    
    return deferred.promise;
  };
}

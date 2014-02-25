var HttpRequest = require('./http-request')
  , LoggerDecorator = require('./logger-decorator')
  , Q = require('q')
  , util = require('util')
  ;

module.exports = LocationQuery;

function LocationQuery(query, $logger) {
  if (typeof query !== 'string')
    throw "query is undefined, null or not a string";
  
  if (typeof $logger !== 'object')
    throw "logger is undefined, null or not an object";

  var logger = new LoggerDecorator($logger, util.format("ninja-dusk-till-dawn (location query '%s')", query));
  
  logger.debug(util.format("Creating new location query..."));

  this.execute = function(limit) {
    var deferred = Q.defer();
    
    var httpRequest = new HttpRequest(
      {
        'host': 'nominatim.openstreetmap.org',
        'port': 80,
        'path': '/search?format=json&addressdetails=1&limit=' + encodeURI(limit || 5) + '&q=' + encodeURI(query)
      },
      $logger);

    logger.debug("Retrieving location information from openstreetmap...");
    
    httpRequest
      .get()
      .then(
        function(json) {
          logger.debug("Openstreetmap returned: " + json);

          var result = JSON.parse(json);
          if (!(result instanceof Array) || result.length == 0)
          {
            logger.debug("Openstreetmap returned an empty result.");
            deferred.reject();

            return;
          }
          
          var mappedResult = result.map(function(item) {
            return {
              "id": item.place_id,
              "display_name": item.display_name,
              "address": {
                "country": item.address.country,
                "state": item.address.state,
                "city": item.address.city,
                "suburb": item.address.suburb,
                "road": item.address.road,
                "house_number": item.address.house_number
              },
              "coords": {
                "lon": item.lon,
                "lat": item.lat
              }
            };
          });
          
          deferred.resolve(mappedResult);
        },
        function() {
          logger.warn("Unable to fetch location information from openstreetmap.");
          deferred.reject();
        });

    return deferred.promise;
  }

  logger.debug("Location query created.");
}
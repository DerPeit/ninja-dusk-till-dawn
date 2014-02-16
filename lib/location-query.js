var HttpRequest = require('./http-request')
  , Q = require('q')
  ;

// Export it
module.exports = LocationQuery;

function LocationQuery(query, logger) {
  this.logger = logger;
  this.query = query;
}

LocationQuery.prototype.execute = function(limit) {
  var self = this;
  var deferred = Q.defer();
  
  var httpRequest = new HttpRequest(
    {
      'host': 'nominatim.openstreetmap.org',
      'port': 80,
      'path': '/search?format=json&addressdetails=1&limit=' + encodeURI(limit || 5) + '&q=' + encodeURI(this.query)
    },
    this.logger);

  this.logger.debug("Retrieving location information from openstreetmap...");
  
  httpRequest
    .get()
    .then(
      function(json) {
        self.logger.debug("Openstreetmap returned: " + json);

        var result = JSON.parse(json);
        if (!(result instanceof Array) || result.length == 0)
        {
          self.logger.debug("Openstreetmap returned an empty result.");
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
        self.logger.warn("Unable to fetch location information from openstreetmap.");
        deferred.reject();
      });

  return deferred.promise;
};

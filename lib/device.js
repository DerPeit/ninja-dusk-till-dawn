var Events = require('events')
  , Logger = require('log4js')
  , stream = require('stream')
  , Suncalc = require('suncalc')
  , Q = require('q')
  , util = require('util')
  ;

// Give our device a stream interface
util.inherits(Device, stream);

// Export it
module.exports = Device;

/**
 * Creates a new Device Object
 *
 * @property {Boolean} readable Whether the device emits data
 * @property {Boolean} writable Whether the data can be actuated
 *
 * @property {Number} G - the channel of this device
 * @property {Number} V - the vendor ID of this device
 * @property {Number} D - the device ID of this device
 *
 * @property {Function} write Called when data is received from the Ninja Platform
 *
 * @fires data - Emit this when you wish to send data to the Ninja Platform
 */
function Device(options) {
  this.readable = true;
  this.writeable = false;

  this.G = "0"; // G is a string a represents the channel
  this.V = 0; // 0 is Ninja Blocks' device list
  this.D = 14; // 2000 is a generic Ninja Blocks sandbox device
  this.name = "Dusk till dawn";

  this.eventEmitter = new Events.EventEmitter();
  this.locations = options.locations || [];
  this.logger = Logger.getLogger('Device');
	
  var self = this;
	
  var getNextMidnight = function() {
    var midnight = new Date();
    
    midnight.setHours(24);
    midnight.setMinutes(0);
    midnight.setSeconds(0);
    midnight.setMilliseconds(0);
    
    return midnight;
  };
    
  var calculateMillisecondsFromNowOnUntil = function(timestamp) {
    var now = new Date();
    return timestamp.getTime() - now.getTime();
  };
    
  var runAt = function(func, timestamp) {
    if (typeof func !== 'function' || typeof timestamp !== 'object' || !(timestamp instanceof Date))
      return;

    var deferred = Q.defer();
    var delay = calculateMillisecondsFromNowOnUntil(timestamp);
    var callback = function() {
      deferred.resolve(func());
    };
    
    if (delay > 0)
      setTimeout(callback, delay);
    else
      deferred.reject("Timestamp " + timestamp + " lies in the past");
    
    return deferred.promise;
  };
  
  var createMonitorFactory = function(id, weatherInfo) {
    self.logger.debug("Creating monitor callbacks for id '" + id + "' and weatherInfo: " + JSON.stringify(weatherInfo));
    
    var resultFactory = function(emit, timestamp) {
      if (typeof emit !== 'string' || typeof timestamp !== 'object' || !(timestamp instanceof Date))
        return;

      self.logger.debug("Creating monitor that emits '" + emit + "' on " + timestamp + "...");

      return function() {
        return runAt(
          function() {
            self.logger.debug("Emitting " + emit + "...");
            self.emit("data", emit);
          },
          timestamp);
      };
    };
    
    var result = {};
    for (var key in weatherInfo) {
      var base = ("-" + key).replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
      var methodName = "start" + base + "Monitor";
      
      result[methodName] = resultFactory(key + "-" + id, weatherInfo[key]);
    }

    return result;
  };
    
  var updateMonitors = function() {
    self.logger.info("Calculating weather info...");

    var deferred = Q.defer();
    for (var i = 0; i < self.locations.length; i++) {
      var location = self.locations[i];

      var suncalc = Suncalc.getTimes(
        new Date(),
        location.coords.lat,
        location.coords.lon);

      var weatherInfo = {
        "night-end": suncalc.nightEnd,
        "astronomical-dawn-start": suncalc.nightEnd,
        "astronomical-dawn-end": suncalc.nauticalDawn,
        "nautical-dawn-start": suncalc.nauticalDawn,
        "nautical-dawn-end": suncalc.dawn,
        "civil-dawn-start": suncalc.dawn,
        "civil-dawn-end": suncalc.sunrise,
        "sunrise-start": suncalc.sunrise,
        "sunrise-end": suncalc.sunriseEnd,
        "morning-golden-hour-start": suncalc.sunriseEnd,
        "morning-golden-hour-end": suncalc.goldenHourEnd,
        "daylight-start": suncalc.goldenHourEnd,
        "daylight-end": suncalc.goldenHour,
        "evening-golden-hour-start": suncalc.goldenHour,
        "evening-golden-hour-end": suncalc.sunsetStart,
        "sunset-start": suncalc.sunsetStart,
        "sunset-end": suncalc.sunset,
        "civil-dusk-start": suncalc.sunset,
        "civil-dusk-end": suncalc.dusk,
        "nautical-dusk-start": suncalc.dusk,
        "nautical-dusk-end": suncalc.nauticalDusk,
        "night-start": suncalc.night
      };
      
      self.logger.debug("Weather info for '" + location.internal_id + "' has been calculated: " + JSON.stringify(weatherInfo));
      location.monitors = createMonitorFactory(location.id, weatherInfo);
    }
    
    self.logger.info("Weather info has been calculated successfully.");
    deferred.resolve();

    return deferred.promise;
  };

  var updateMonitorsNowAndEveryMidnight = function() {
    return updateMonitors().then(function() {
      self.eventEmitter.emit("monitorsUpdated");
      
      var nextMidnight = getNextMidnight();
      return runAt(updateMonitorsNowAndEveryMidnight, nextMidnight);
    });
  };
  
  var startLocationMonitors = function() {
    self.logger.info("Starting location monitors...");
    
    var successCallbackFactory = function(location, monitor) {
      return function() {
        self.logger.debug("Monitor " + monitor + " for location '" + location.internal_id + "' has emitted data.");
      };
    };
    
    var errorCallbackFactory = function(location, monitor) {
      return function(ex) {
            self.logger.warn("Monitor " + monitor + " for location '" + location.internal_id + "' hat not emitted any data. " + ex);
      };
    };
    
    for (var i = 0; i < self.locations.length; i++) {
      var location = self.locations[i];
      var monitors = location.monitors;
      
      for (var monitor in monitors) {
        monitors[monitor].call(location).then(
          successCallbackFactory(location, monitor),
          errorCallbackFactory(location, monitor));
        
        self.logger.debug("Monitor " + monitor + " for location '" + location.internal_id + "' started.");
      }
    }

    self.logger.info("All location monitors have been started successfully.");
  };

  // TODO: Find another way to trigger certain events to save them in the dashboard  
  var emitDataForAllLocations = function() {
    self.logger.debug("Emitting data for all locations...");
    
    for (var i = 0; i < self.locations.length; i++) {
      var id = self.locations[i].id;
      var data = [
        "night-end", "astronomical-dawn-start", "astronomical-dawn-end",
        "nautical-dawn-start", "nautical-dawn-end", "civil-dawn-start",
        "civil-dawn-end", "sunrise-start", "sunrise-end",
        "morning-golden-hour-start", "morning-golden-hour-end", "daylight-start",
        "daylight-end", "evening-golden-hour-start", "evening-golden-hour-end",
        "sunset-start", "sunset-end", "civil-dusk-start",
        "civil-dusk-end", "nautical-dusk-start", "nautical-dusk-end",
        "night-start"
      ];
      
      for (var j = 0; j < data.length; j++) {
        var d = data[j] + "-" + id;

        self.logger.debug("Emitting " + d + "...");
        self.emit("data", d);
      }
    }

    self.logger.debug("Data for all locations has been emitted.");
  };
  
  process.nextTick(function() {
    emitDataForAllLocations();
    self.eventEmitter.on("monitorsUpdated", startLocationMonitors);
    updateMonitorsNowAndEveryMidnight();
  });
};

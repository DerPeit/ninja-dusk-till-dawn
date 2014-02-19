var Emitter = require('./emitter')
  , Events = require('./events')
  , LoggerDecorator = require('./logger-decorator')
  , stream = require('stream')
  , util = require('util')
  ;

util.inherits(Device, stream);
module.exports = Device;

function Device(eventbus, $logger, locations) { 
  if (typeof eventbus !== 'object' || typeof eventbus.addListener !== 'function' || typeof eventbus.removeListener !== 'function')
    throw "eventbus is undefined, not an object or not sufficient for this context";
  
  if (typeof $logger !== 'object')
    throw "logger is undefined, null or not an object";

  var logger = new LoggerDecorator($logger, "ninja-dusk-till-dawn (device)");
    
  logger.debug("Creating new device...");
  
  this.readable = true;
  this.writeable = false;

  this.G = "0"; // G is a string a represents the channel
  this.V = 0; // 0 is Ninja Blocks' device list
  this.D = 14; // 2000 is a generic Ninja Blocks sandbox device
  this.name = "Dusk till dawn";

  var self = this;
  var emitters = {};
  var running = false;
  
  var locationAdded = function(internal_id, location) {
    logger.debug(util.format("Adding a new location '%s'...", internal_id));
    
    if (typeof internal_id !== 'string')
      throw "internal_id is undefined, null or not a string";
    
    if (emitters.hasOwnProperty(internal_id))
      throw util.format("Emitter for internal_id %s does already exist", internal_id);
    
    var emitter = new Emitter(
      location.id, 
      location.coords, 
      eventbus,
      $logger);
    
    if (running)
      emitter.start();
    
    emitters[internal_id] = emitter;
    
    logger.debug(util.format("Location '%s' created.", internal_id));
  };
  
  var locationDeleted = function(internal_id) {
    logger.debug(util.format("Deleting an existing location '%s'...", internal_id));
    
    if (typeof internal_id !== 'string')
      throw "internal_id is undefined, null or not a string";
    
    if (!emitters.hasOwnProperty(internal_id))
      throw util.format("Emitter for internal_id %s could not be found", internal_id);
    
    var emitter = emitters[internal_id];
    
    if (running)
      emitter.stop();
    
    delete emitters[internal_id];

    logger.debug(util.format("Existing '%s' deleted.", internal_id));
  };
  
  var suncalcEventOccurred = function(event) {
    logger.debug(util.format("Emitting '%s'...", event));
    
    self.emit("data", event);
    
    logger.debug(util.format("'%s' emitted.", event));
  };
  
  var startEmitters = function() {
    logger.debug("Starting emitters...");
    
    for (var internal_id in emitters)
      emitters[internal_id].start();
    
    logger.debug("Emitters started.");
  };
  
  var stopEmitters = function() {
    logger.debug("Stopping emitters...");
    
    for (var internal_id in emitters)
      emitters[internal_id].stop();
    
    logger.debug("Emitters stopped.");
  };
  
  this.start = function() {
    if (running)
      return;
    
    logger.info("Starting device...");
    
    eventbus.addListener(Events.LOCATION_ADDED, locationAdded);
    eventbus.addListener(Events.LOCATION_DELETED, locationDeleted);
    eventbus.addListener(Events.SUNCALC_EVENT_OCCURRED, suncalcEventOccurred);
    
    startEmitters();
    running = true;
    
    logger.info("Devices started.");
  };
  
  this.stop = function() {
    if (!running)
      return;
    
    logger.info("Stopping device...");
    
    running = false;
    stopEmitters();
    
    eventbus.removeListener(Events.LOCATION_ADDED, locationAdded);
    eventbus.removeListener(Events.LOCATION_DELETED, locationDeleted);
    eventbus.removeListener(Events.SUNCALC_EVENT_OCCURRED, suncalcEventOccurred);
    
    logger.info("Device stopped.");
  };
  
  if (typeof locations === 'object' && locations instanceof Array)
    for (var i = 0; i < locations.length; i++)
      locationAdded(locations[i].internal_id, locations[i]);
  
  logger.debug("Device created.");
}
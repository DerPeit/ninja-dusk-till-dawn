var Events = require('./events')
  , Job = require('./job')
  , LoggerDecorator = require('./logger-decorator')
  , Suncalc = require('suncalc')
  , util = require('util')
  ;

require('datejs');

module.exports = Emitter;

function Emitter(public_id, coords, eventbus, $logger) {
  if (typeof public_id !== 'string')
    throw "public_id is undefined or not a string";
  
  if (typeof coords !== 'object' || typeof coords.lat === 'undefined' || typeof coords.lon === 'undefined')
    throw "coords is undefined, not an object or not sufficient for this context";
  
  if (typeof eventbus !== 'object' || typeof eventbus.addListener !== 'function' || typeof eventbus.removeListener !== 'function')
    throw "eventbus is undefined, not an object or not sufficient for this context";

  if (typeof $logger !== 'object')
    throw "logger is undefined, null or not an object";

  var logger = new LoggerDecorator($logger, util.format("ninja-dusk-till-dawn (emitter %s)", public_id));
  
  logger.debug(util.format("Creating new emitter..."));
  
  var jobs = [];
  var running = false;
  
  var calculateTimestamps = function() {
    logger.debug("Calculating timestamps...");
    
    var suncalc;
    try {
      suncalc = Suncalc.getTimes(
        Date.today().addHours(12),
        coords.lat,
        coords.lon);
    } catch (e) {
      logger.error(util.format("Timestamp calculation failed. Error was: %s", e));
      throw e;
    }
    
    logger.debug("Timestamp calculation succeeded.");
    
    return {
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
      "astronomical-dusk-start": suncalc.nauticalDusk,
      "astronomical-dusk-end": suncalc.night,
      "night-start": suncalc.night,
    };
  };
  
  var createNewJobs = function(timestamps) {
    logger.debug("Creating new jobs...");
    
    var newJobs = [];
    
    for (var name in timestamps) {
      if (name === 'getName')
        continue;

      var timestamp = timestamps[name];
      var job;
      
      try {
        job = new Job(
          public_id, 
          name, 
          timestamp, 
          eventbus, 
          $logger);
      } catch (e) {
        logger.error(util.format("Unable to create job '%s' (name: %s, timestamp: %s). Error was: %s", public_id, name, timestamp, e));
        throw e;
      }

      newJobs.push(job);
    }
    
    logger.debug("Job creation succeeded.");
    
    return newJobs;
  };
  
  var startJobs = function() {
    logger.debug("Starting jobs...");
    
    for (var i = 0; i < jobs.length; i++)
      try {
        jobs[i].start();
      } catch (e) {
        logger.warn(util.format("Unable to start job #%d. Error was: %s", i, e));
      }
    
    logger.debug("Jobs started.");
  };
  
  var stopJobs = function() {
    logger.debug("Stopping jobs...");
    
    for (var i = 0; i < jobs.length; i++)
      try {
        jobs[i].stop();
      } catch (e) {
        logger.warn(util.format("Unable to start job #%d. Error was: %s", i, e));
      }
    
    logger.debug("Jobs stopped.");
  };

  var shallUpdate = function() {
    logger.info("Updating timestamps and creating new jobs...");
    
    var timestamps = calculateTimestamps();
    var newJobs = createNewJobs(timestamps);
    
    if (running)
      stopJobs();
    
    jobs = newJobs;
    
    if (running)
      startJobs();
  };
  
  this.start = function() {
    if (running)
      return;

    logger.debug("Starting emitter...");
    
    eventbus.addListener(Events.SHALL_UPDATE, shallUpdate);
    shallUpdate();
    startJobs();
    running = true;
    
    logger.debug("Emitter started.");
  };
  
  this.stop = function() {
    if (!running)
      return;
    
    logger.debug("Stopping emitter...");
    
    running = false;
    stopJobs();
    eventbus.removeListener(Events.SHALL_UPDATE, shallUpdate);
    
    logger.debug("Emitter stopped.");
  };
  
  logger.debug("Emitter created.");
};

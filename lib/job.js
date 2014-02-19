var CronJob = require('cron').CronJob
  , Events = require('./events')
  , LoggerDecorator = require('./logger-decorator')
  , util = require('util')
  ;

module.exports = Job;

function Job(public_id, name, timestamp, eventbus, $logger) {
  if (typeof public_id !== 'string')
    throw "public_id is undefined or not a string";

  if (typeof name !== 'string')
    throw "name is undefined or not a string";

  if (typeof timestamp !== 'object' || !(timestamp instanceof Date))
    throw "timestamp is undefined or not of type Date";
  
  if (typeof eventbus !== 'object' || typeof eventbus.emit !== 'function')
    throw "eventbus is undefined, not an object or not sufficient for this context";

  if (typeof $logger !== 'object')
    throw "logger is undefined, null or not an object";

  var logger = new LoggerDecorator($logger, util.format("ninja-dusk-till-dawn (job %s, %s, %s)", public_id, name, timestamp));

  logger.debug("Creating new job...");

  var onTick = function() {
    eventbus.emit(Events.SUNCALC_EVENT_OCCURRED, util.format("%s-%s", name, public_id));
  };

  var job = new CronJob({
    "cronTime": timestamp,
    "onTick": onTick,
    "start": false,
    "context": this,
  });
  
  this.start = function() {
    logger.debug("Starting job...");
    job.start();
  };
  
  this.stop = function() {
    logger.debug("Stopping job...");
    job.stop();
  };
  
  logger.debug("Job created.");
}
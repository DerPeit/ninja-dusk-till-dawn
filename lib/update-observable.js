var CronJob = require('cron').CronJob
  , Events = require('./events')
  , LoggerDecorator = require('./logger-decorator')
  ;

module.exports = UpdateObservable;

function UpdateObservable(eventbus, $logger) {
  if (typeof eventbus !== 'object' || typeof eventbus.emit !== 'function')
    throw "eventbus is undefined, not an object or not sufficient for this context";
  
  if (typeof $logger !== 'object')
    throw "logger is undefined, null or not an object";

  var logger = new LoggerDecorator($logger, "ninja-dusk-till-dawn (update observable)");

  logger.debug("Creating new update observable...");
  
  var onTick = function() {
    eventbus.emit(Events.SHALL_UPDATE, this);
  };

  var job = new CronJob({
    "cronTime": "0 0 * * *",
    "onTick": onTick,
    "start": false,
    "context": this,
  });
  
  this.start = function() {
    logger.info("Starting update observable...");
    job.start();
  };
  
  this.stop = function() {
    logger.info("Stopping update observable...");
    job.stop();
  };
  
  logger.debug("Update observable created.");
}
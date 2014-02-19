var configHandlers = require('./lib/config-handlers')
  , Device = require('./lib/device')
  , EventBus = require('events').EventEmitter
  , stream = require('stream')
  , UpdateObservable = require('./lib/update-observable')
  , util = require('util')
  ;

// Give our driver a stream interface
util.inherits(DuskTillDawn, stream);

// Export it
module.exports = DuskTillDawn;

/**
 * Called when our client starts up
 * @constructor
 *
 * @param  {Object} opts Saved/default driver configuration
 * @param  {Object} app  The app event emitter
 * @param  {String} app.id The client serial number
 *
 * @property  {Function} save When called will save the contents of `opts`
 * @property  {Function} config Will be called when config data is received from the Ninja Platform
 *
 * @fires register - Emit this when you wish to register a device (see Device)
 * @fires config - Emit this when you wish to send config data back to the Ninja Platform
 */
function DuskTillDawn(opts, app) {
  this._app = app;
  this._opts = opts;

  this.eventbus = new EventBus();
  
  var self = this;
  var locations = opts.locations || [];
  var updateObservable = new UpdateObservable(this.eventbus, app.log);
  var device = new Device(this.eventbus, app.log, locations);

  /**
   * Called when a user prompts a configuration.
   * If `rpc` is null, the user is asking for a menu of actions
   * This menu should have rpc_methods attached to them
   *
   * @param  {Object}   rpc     RPC Object
   * @param  {String}   rpc.method The method from the last payload
   * @param  {Object}   rpc.params Any input data the user provided
   * @param  {Function} cb      Used to match up requests.
   */
  this.config = function(rpc, cb) {
    // If rpc is null, we should send the user a menu of what he/she
    // can do.
    // Otherwise, we will try action the rpc method
    if (!rpc)
      return configHandlers.menu.call(this, cb);
    else if (typeof configHandlers[rpc.method] === "function")
      return configHandlers[rpc.method].call(this, rpc.params, cb);
    else
      return cb(true);
  };
	
  app.on('client::up',function() {
    self.emit('register', device);

    process.nextTick(function() {
      updateObservable.start();
      device.start();
    });
  });
};

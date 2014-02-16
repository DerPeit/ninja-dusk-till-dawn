var Device = require('./lib/device')
  , util = require('util')
  , stream = require('stream')
  , configHandlers = require('./lib/config-handlers');

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

  var self = this;
	
  app.on('client::up',function(){
    // The client is now connected to the Ninja Platform
    // Register a device
    self.emit('register', new Device(self._opts, self._app.log));
  });
};

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
DuskTillDawn.prototype.config = function(rpc, cb) {
  var self = this;

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

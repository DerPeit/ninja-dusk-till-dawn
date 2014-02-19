module.exports = LoggerDecorator;

function LoggerDecorator(logger, prefix) {
  if (typeof logger !== 'object')
    throw "logger is undefined, null or not an object";

  var log = function(method) {
    return function(s) {
      return logger[method].call(logger, prefix + ": " + s);
    };
  };
  
  var methods = ["debug", "info", "warn", "error", "fatal"];
  for (var i = 0; i < methods.length; i++) {
    var m = methods[i];
    this[m] = log(m);
  };
}
var configMessages = require('./config-messages')
  , Events = require('./events')
  , LocationQuery = require('./location-query')
  , util = require('util')
  ;

var clone = function(dolly) {
  return JSON.parse(JSON.stringify(dolly));
};

var createMainMenu = function() {
  var messages = clone(configMessages.menu);
  var locations = this._opts.locations || [];
  var options = [];
    
  for (var i = 0; i < locations.length; i++) {
    var location = locations[i];
    
    options.push({
      "value": location.internal_id,
      "name": location.name,
      "selected": false
    });
  }

  if (options.length > 0) {
    messages.contents.splice(
      1, 
      1, 
      {
        "type": "input_field_select",
        "label": messages.contents[1].text,
        "field_name": "selected_location",
        "options": options
      });
      
    messages.contents.splice(
      2,
      0,
      {
        "type": "submit",
        "name": "Delete selected location",
        "rpc_method": "prepare_delete"
      });
  } else
      messages.contents.splice(
      2,
      0,
      {
        "type": "paragraph",
        "text": "- None -"
      });
      
  return messages;
}

var createSearchResultMenu = function(result, query) {
  switch (result.length) {
    case 1:
      return createSingleSearchResultMenu.call(this, result, query);
    
    default:
      return createMultipleSearchResultsMenu.call(this, result, query);
  }
};

var createSingleSearchResultMenu = function(result, query) {
  var messages = clone(configMessages.query.single);
  var contents = messages.contents;

  contents[1].text = util.format(contents[1].text, query);
  contents[2].value = encodeURI(JSON.stringify(result));
  contents[3].value = encodeURI(query);

  contents.splice(4, 0, {
      "type": "paragraph",
      "text": result[0].display_name
  });
  
  contents.splice(5, 0, {
  "type": "link",
  "href": util.format("https://www.google.com/maps/?q=%s,%s", encodeURI(result[0].coords.lat), encodeURI(result[0].coords.lon)),
  "name": "View on map"
  });

  return messages;
};

var createMultipleSearchResultsMenu = function(result, query) {
  var messages = clone(configMessages.query.multiple);
  var contents = messages.contents;
  var i = 4, j = 0;

  contents[0].text = util.format(contents[0].text, result.length);
  contents[1].text = util.format(contents[1].text, query, result.length);
  contents[2].value = encodeURI(JSON.stringify(result));
  contents[3].value = encodeURI(query);

  for (var k = 0; k < result.length; k++) {
    var item = result[k];
    
    contents.splice(i++, 0, {
      "type": "paragraph",
      "text": item.display_name
    });

    contents.splice(i++, 0, {
      "type": "link",
      "href": util.format("https://www.google.com/maps/?q=%s,%s", encodeURI(item.coords.lat), encodeURI(item.coords.lon)),
      "name": "View on map"
    });

    contents.splice(i++, 0, {
      "type": "submit",
      "name": "Choose this location",
      "rpc_method": "choose_" + j++
    });
  }

  return messages;
};

var createConfirmDeleteMenu = function(id, name) {
  var messages = clone(configMessages.delete);
  var locations = this._opts.locations || [];
  var i = locations.map(function(x) { return x.internal_id; }).indexOf(id);
  var location = locations[i];
    
  messages.contents.push({
    "type": "input_field_hidden",
    "field_name": "id",
    "value": id
  });
    
  messages.contents.splice(
    1,
    0,
    {
      "type": "paragraph",
      "text": name
    });

  return messages;
};

/**
 * Called from the driver's config method when a
 * user wants to see a menu to configure the driver
 * @param  {Function} cb Callback to send a response back to the user
 */
exports.menu = function(cb) {
  exports.main.call(this, null, cb);
};

exports.main = function(params, cb) {
  cb(null, createMainMenu.call(this));
};

exports.prepare_delete = function(params, cb) {
  var id = params.selected_location;
  var locations = this._opts.locations || [];
  var i = locations.map(function(x) { return x.internal_id; }).indexOf(id);
  var name = locations[i].name;
  
  cb(null, createConfirmDeleteMenu.call(this, id, name));
};

exports.confirm_delete = function(params, cb) {
  var id = params.id;
  var locations = this._opts.locations || [];
  var i = locations.map(function(x) { return x.internal_id; }).indexOf(id);
  locations.splice(i, 1);
    
  this.save();
  this.eventbus.emit(Events.LOCATION_DELETED, id);
  
  exports.menu.call(this, cb);
};

exports.prepare_add = function(params, cb) {
  var self = this;
  var query = new LocationQuery(params.q, this._app.log);
  
  query
    .execute(5)
    .then(
      function(result) {
        if (typeof self._opts.locations !== 'object')
          self._opts.locations = [];

        var messages = createSearchResultMenu.call(this, result, params.q, cb);
        cb(null, messages);
      },
      function(e) {
        var messages = createMainMenu.call(self);
        
        messages.contents[messages.contents.length - 3].value = params.q;
        messages.contents.splice(
          messages.contents.length - 2, 
          0,
          {
            "type": "paragraph",
            "text": '"' + params.q + '" could not be found. Please try again.'
          });
        
        cb(null, messages);
      });
};

exports.confirm_add = function(params, cb) {
  var result = JSON.parse(decodeURI(params.result))[0]
  var q = decodeURI(params.q);
  var id = params.id;
  var name = params.name;
  var locations = this._opts.locations || [];

  if (!/^[a-z][a-z0-9]*$/.exec(id)) {
    var messages = createSearchResultMenu.call(this, [ result ], q, cb);
    var contents = messages.contents;
    
    contents[contents.length - 4].value = id;
    contents[contents.length - 3].value = name;
    
    contents.splice(
      contents.length - 2,
      0,
      {
        "type": "paragraph",
        "text": "The id you enteres was invalid. Please make sure that you just use lowercase letters and numbers and don't start with a number."
      });

    cb(null, messages);
    return;
  }
  
  if (locations.map(function(x) { return x.id; }).indexOf(id) !== -1) {
    var messages = createSearchResultMenu.call(this, [ result ], q, cb);
    var contents = messages.contents;
    
    contents[contents.length - 4].value = id;
    contents[contents.length - 3].value = name;
    
    contents.splice(
      contents.length - 2,
      0,
      {
        "type": "paragraph",
        "text": "The id you enteres is already in use. Please enter something different."
      });

    cb(null, messages);
    return;
  }
  
  if (name === "") {
    var messages = createSearchResultMenu.call(this, [ result ], q, cb);
    var contents = messages.contents;
    
    contents[contents.length - 4].value = id;
    contents[contents.length - 3].value = name;
    
    contents.splice(
      contents.length - 2,
      0,
      {
        "type": "paragraph",
        "text": "Please enter a name."
      });

    cb(null, messages);
    return;
  }
  
  var location = {
    "internal_id": result.id,
    "id": id,
    "name": name,
    "address": result.address,
    "coords": result.coords
  };
  
  locations.push(location);
  
  this._opts.locations = locations;
  this.save();
  this.eventbus.emit(Events.LOCATION_ADDED, result.id, location);
  
  exports.menu.call(this, cb);
};

for (var i = 0; i < 5; i++)
  eval('\
    exports["choose_' + i + '"] = function(params, cb) {\
      var result = [ JSON.parse(decodeURI(params.result))[' + i + '] ];\
      var menu = createSearchResultMenu.call(this, result, decodeURI(params.q));\
      \
      cb(null, menu);\
    };\
  ');

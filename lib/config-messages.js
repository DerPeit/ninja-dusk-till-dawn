exports.menu = {
  "contents": [
    { "type": "paragraph", "text": "You can add several locations here. Notifications will then be sent to the ninja cloud for every entry." },
    { "type": "paragraph", "text": "Configured locations:" },
    
    { "type": "paragraph", "text": "Please enter your search string here:" },
    { "type": "input_field_text", "field_name": "q", "value": "", "label": "", "placeholder": "e.g. London, United Kingdom", "required": true },
    { "type": "submit", "name": "Add new location", "rpc_method": "prepare_add" },
    { "type": "close", "name": "Close" },
  ]
};

exports.query = {
  "single": {
    "contents": [
      { "type": "heading", "text": "Result found." },
      { "type": "paragraph", "text": "Your query for '%s' returned the following result:" },
      { "type": "input_field_hidden", "field_name": "result", "value": "" },
      { "type": "input_field_hidden", "field_name": "q", "value": "" },
      
      { "type": "paragraph", "text": "Please enter some more information to identify this location in the configuration dialog and in the dashboard." },
      { "type": "paragraph", "text": "Hint: The identifier will be used for events triggered by the driver and pop up in the dashboard. It thus cannot contain any special chars." },
      { "type": "input_field_text", "field_name": "id", "value": "", "label": "", "placeholder": "Identifier", "required": true },
      { "type": "input_field_text", "field_name": "name", "value": "", "label": "", "placeholder": "Display name", "required": true },
      { "type": "submit", "name": "Save location", "rpc_method": "confirm_add" },
      { "type": "submit", "name": "Back", "rpc_method": "main" },
    ]
  },
  "multiple": {
    "contents": [
      { "type": "heading", "text": "%s results found." },
      { "type": "paragraph", "text": "Your query for '%s' returned %s results. Please select the best match from the following list:" },
      { "type": "input_field_hidden", "field_name": "result", "value": "" },
      { "type": "input_field_hidden", "field_name": "q", "value": "" },
      
      { "type": "paragraph", "text": "" },
      { "type": "submit", "name": "Back", "rpc_method": "main" },
    ]
  }
};

exports.delete = {
  "contents": [
    { "type": "paragraph", "text": "You are about to delete the following location:" },
    
    { "type": "paragraph", "text": "Are you sure about this?" },
    { "type": "submit", "name": "Delete location", "rpc_method": "confirm_delete" },
    { "type": "submit", "name": "Keep location", "rpc_method": "main" },
  ]
};

exports.location_info = {
  "contents": [
    { "type": "heading", "text": "%s" },
    { "type": "input_field_textarea", "label": "Location info", "field_name": "", "value": "House no.: %s\nRoad: %s\nSuburb: %s\nCity: %s\nCounty: %s\nState: %s\nCountry: %s" },
    { "type": "paragraph", "text": "" },
    { "type": "link", "href": "", "name": "View on map" },
    { "type": "paragraph", "text": "Use the buttons below to emit certain data the driver usually emits at certain times of the day to save them in the dashboard without waiting ages for them to pop up automatically:" },
    { "type": "input_field_hidden", "field_name": "selected_location", "value": "" },
    { "type": "input_field_select", "field_name": "data", "label": "Event", "options": [
      { "selected": false, "value": "night-end", "name": "Night ends" },
      { "selected": false, "value": "astronomical-dawn-start", "name": "Astronomical dawn starts" },
      { "selected": false, "value": "astronomical-dawn-end", "name": "Astronomical dawn ends" },
      { "selected": false, "value": "nautical-dawn-start", "name": "Nautical dawn starts" },
      { "selected": false, "value": "nautical-dawn-end", "name": "Nautical dawn ends" },
      { "selected": false, "value": "civil-dawn-start", "name": "Civil dawn starts" },
      { "selected": false, "value": "civil-dawn-end", "name": "Civil dawn ends" },
      { "selected": false, "value": "sunrise-start", "name": "Sunrise starts" },
      { "selected": false, "value": "sunrise-end", "name": "Sunrise ends" },
      { "selected": false, "value": "morning-golden-hour-start", "name": "Morning golden hour starts" },
      { "selected": false, "value": "morning-golden-hour-end", "name": "Morning golden hour ends" },
      { "selected": false, "value": "daylight-start", "name": "Daylight starts" },
      { "selected": false, "value": "daylight-end", "name": "Daylight ends" },
      { "selected": false, "value": "evening-golden-hour-start", "name": "Evening golden hour starts" },
      { "selected": false, "value": "evening-golden-hour-end", "name": "Evening golden hour ends" },
      { "selected": false, "value": "sunset-start", "name": "Sunset starts" },
      { "selected": false, "value": "sunset-end", "name": "Sunset ends" },
      { "selected": false, "value": "civil-dusk-start", "name": "Civil dusk starts" },
      { "selected": false, "value": "civil-dusk-end", "name": "Civil dusk ends" },
      { "selected": false, "value": "nautical-dusk-start", "name": "Nautical dusk starts" },
      { "selected": false, "value": "nautical-dusk-end", "name": "Nautical dusk ends" },
      { "selected": false, "value": "astronomical-dusk-start", "name": "Astronomical dusk starts" },
      { "selected": false, "value": "astronomical-dusk-end", "name": "Astronomical dusk ends" },
      { "selected": false, "value": "night-start", "name": "Night starts" },
    ]},
    { "type": "paragraph", "text": "" },
    { "type": "submit", "name": "Emit selected data", "rpc_method": "emit" },
    { "type": "link", "href": "https://github.com/DerPeit/ninja-dusk-till-dawn/blob/master/README.md#supported-events", "name": "What do these events mean?" },
    { "type": "paragraph", "text": "" },
    { "type": "submit", "name": "Back", "rpc_method": "main" },
  ]
};
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

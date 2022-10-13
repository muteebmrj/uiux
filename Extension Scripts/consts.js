// this is the first content script that executes;
var BDTLL = {};

function consts_main() {
  if (window.top != window.self) {
    return;
  }

  let aux_consts = {
// !MarkerConstants!. Do not remove. Used in constants.py
    // Command constants
    COMMAND_APH_REQUEST: 100,
    COMMAND_TEMP_WHITELIST_AND_PROCEED: 101,
    COMMAND_USER_WHITELIST_AND_PROCEED: 102,
    COMMAND_LINK_SCANNER: 103,
    COMMAND_SEND_BROWSER_INFO: 104,
    COMMAND_UPDATE_POPUP_APPEARANCE: 105,
    COMMAND_VISIBILITY_CHANGED: 106,
    
    COMMAND_SETTING_APH: 120,
    COMMAND_NAVIGATE_TO: 121,
    COMMAND_SETTING_SEARCH_ANALYZER: 122,
    
    
    // Logging constants
    LOGGING_ALL: 100,
    LOGGING_DEBUG: 50,
    LOGGING_INFO: 40,
    LOGGING_WARN: 30,
    LOGGING_ERROR: 20,
    LOGGING_FATAL: 10,
    LOGGING_OFF: 0,
    
    
    // Search engine constants
    SEARCH_GOOGLE: "google",
    SEARCH_DUCKDUCKGO: "duckduckgo",
    SEARCH_YAHOO_JAPAN: "search.yahoo.co.jp",
    SEARCH_YAHOO: "search.yahoo",
    SEARCH_BING: "bing",
    SEARCH_ECOSIA: "ecosia",
// !MarkerConstants!. Do not remove. Used in constants.py
  };

  // LOGGING LEVEL CONFIG
// !MarkerLogging!. Do not remove. Used in constants.py
  aux_consts.LOGGING_LEVEL = aux_consts.LOGGING_OFF;
// !MarkerLogging!. Do not remove. Used in constants.py
  
  BDTLL.consts = {};
  for (let property in aux_consts) {
    let configObject = {
      value: aux_consts[property],
      writable: false
    };
    
    Object.defineProperty(BDTLL.consts, property, configObject);
  }
}

consts_main();


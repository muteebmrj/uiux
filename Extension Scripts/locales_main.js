var BDTLL;

function locales_main() {
  if (window.top != window.self) {
    return;
  }
  log.info("locales.js started");

  if (typeof(BDTLL.locales) === 'undefined') {
    BDTLL.locales = {};
  }
  
  BDTLL.locales.utils = function() {
    function get_localized_text(key) {
      if (key in BDTLL.locales.store) {
        return BDTLL.locales.store[key]
      }

      return key
    }
    
    return {
      get_localized_text: get_localized_text,
    }
  }();
}

locales_main();



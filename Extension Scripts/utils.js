var log;
var BDTLL;

if (typeof(BDTLL) === "undefined") {
  BDTLL = {};
}

function utils_main() {
  if (window.top != window.self) {
    return;
  }

  function addRightPadding(str, len, delim) {
    let padding = delim.repeat(len);
    return (str + padding).substring(0, len);
  }

  function log_function(level, levelString, message, tag) {
    if (level > BDTLL.consts.LOGGING_LEVEL) {
      return;
    }
    let delim = " ";

    if (typeof tag === "undefined") {
      tag = "default";
    }
    tag += ":";
    tag = addRightPadding(tag, 12, delim);

    let prefix = "BDTLL_";
    levelString = addRightPadding(prefix + levelString + ";", 15, delim);

    console.log( levelString + delim + "Tag = " + tag, JSON.parse(JSON.stringify(message)) );
  }

  log = {
    debug: function(message, tag) {log_function(BDTLL.consts.LOGGING_DEBUG, "DEBUG", message, tag);},
    info: function(message, tag) {log_function(BDTLL.consts.LOGGING_INFO, "INFO", message, tag);},
    warn: function(message, tag) {log_function(BDTLL.consts.LOGGING_WARN, "WARN", message, tag);},
    error: function(message, tag) {log_function(BDTLL.consts.LOGGING_ERROR, "ERROR", message, tag);},
    fatal: function(message, tag) {log_function(BDTLL.consts.LOGGING_FATAL, "FATAL", message, tag);},
  };


  log.info("utils.js started");
  
  BDTLL.utils = function() {
    function BDTLL_removeHTMLTags(strInput) {
      strInput = strInput.replace(/&(lt|gt);/g, function(strMatch, p1) {
        return (p1 == "lt") ? "<" : ">";
      });
      var strTagStrippedText = strInput.replace(/<\/?[^>]+(>|$)/g, "");
      return strTagStrippedText;
    }
    
    function BDTLL_trim(stringToTrim) {
      return stringToTrim.replace(/^\s+|\s+$/g, "");
    }
    
    function BDTLL_ltrim(stringToTrim) {
      return stringToTrim.replace(/^\s+/, "");
    }
    
    function BDTLL_rtrim(stringToTrim) {
      return stringToTrim.replace(/\s+$/, "");
    }
    
    function BDTLL_string_endsWith(init, str) {
      return (init.match(str + "$") == str);
    }
    
    /**
     * Obtain a GET parameter value.
     * @param search list of the parameters. This should be extracted from the GET
     * list or using location.search.
     * @param paramName the name of the needed parameter
     * @return the parameter value or null if the parameter is not found.
     */
    function BDTLL_getParam(search, paramName) {
      var compareKeyValuePair = function(pair) {
        var key_value = pair.split('=');
        var decodedKey = decodeURIComponent(key_value[0]);

        // var value = decodeURIComponent(key_value[1]);
        var value = key_value[1];

        if (decodedKey == paramName) {
          return value;
        }
        return null;
      };
      
      var comparisonResult = null;
      
      if (search.indexOf('&') > -1) {
        var params = search.split('&');
        for (var i = 0; i < params.length; i++) {
          comparisonResult = compareKeyValuePair(params[i]);
          if (comparisonResult !== null) {
            break;
          }
        }
      }
      else {
        comparisonResult = compareKeyValuePair(search);
      }
      
      return comparisonResult;
    }
    
    function BDTLL_validURL(str) {
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
                               '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
                               '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                               '(\\:\\d+)?(\/[-a-z\\d%_.~+]*)*'+ // port and path
                               '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
                               '(\\#[-a-z\\d_]*)?$','i'); // fragment locater
      if(!pattern.test(str)) {
        return false;
      }
      else {
        return true;
      }
    }
    
    function getPreviousURL() {
      var url = document.referrer;
      
      if (url == "") {
        url = BDTLL.utils.getParam(document.location.search.substring(1), 'url');
      }
      
      return url;
    }
    
    // Determine if the URL is a search result and should have the links scanned
    function BDTLL_get_domain_for_link_scan(hostURL) {
      try {
        var tempURL = new URL(hostURL);
        if (tempURL.hostname.indexOf(BDTLL.consts.SEARCH_GOOGLE) >= 0) {
          return BDTLL.consts.SEARCH_GOOGLE;
        }
        if (tempURL.hostname.indexOf(BDTLL.consts.SEARCH_YAHOO_JAPAN) >= 0) {
          return BDTLL.consts.SEARCH_YAHOO_JAPAN;
        }
        if (tempURL.hostname.indexOf(BDTLL.consts.SEARCH_YAHOO) >= 0) {
          return BDTLL.consts.SEARCH_YAHOO;
        }
        if (tempURL.hostname.indexOf(BDTLL.consts.SEARCH_BING) >= 0) {
          return BDTLL.consts.SEARCH_BING;
        }
        if (tempURL.hostname.indexOf(BDTLL.consts.SEARCH_DUCKDUCKGO) >= 0) {
          return BDTLL.consts.SEARCH_DUCKDUCKGO;
        }
        if (tempURL.hostname.indexOf(BDTLL.consts.SEARCH_ECOSIA) >= 0) {
          return BDTLL.consts.SEARCH_ECOSIA;
        }
      }
      catch (exception) {
        return false;
      }

      return false;
    }

      
    function makeToast(message) {
      let div = document.createElement("div");
      div.style = "z-index: 99999999999; position: fixed; width: 20vw; height: 10vh; bottom: 10vh; left: 40vw; background-color: black; border: 2px solid gray; opacity: 1.00;";
      let para = document.createElement("p");
      para.innerHTML = message;
      para.style = "position: relative; top: 50%; left: 50%; transform: translate(-50%, -50%);color: white; text-align: center; margin: 0px;";
    
      div.appendChild(para);
      document.body.appendChild(div);
      
      setTimeout(function() {
        let intervalId = setInterval(function() {
          let opacity = parseFloat(div.style.opacity);
          opacity -= 0.01;
          div.style.opacity = opacity;
          
          if (Math.abs(opacity) <= 0.05) {
            clearInterval(intervalId);
            document.body.removeChild(div);
          }
        }, 20);
      
      }, 1500);
    }

    function objectIsEmpty(object) {
      return Object.keys(object).length === 0 && object.constructor === Object
    }

    function startWhenDocumentIsReady(func) {
      if (document.readyState !== "loading") {
        func();
      }
      else {
        document.addEventListener("DOMContentLoaded", func);
      }
    } 
    
    return {
      removeHTMLTags: BDTLL_removeHTMLTags,
      trim: BDTLL_trim,
      ltrim: BDTLL_ltrim,
      rtrim: BDTLL_rtrim,
      string_endsWith: BDTLL_string_endsWith,
      getParam: BDTLL_getParam,
      validURL: BDTLL_validURL,
      getPreviousURL: getPreviousURL,
      get_domain_for_link_scan: BDTLL_get_domain_for_link_scan,
      makeToast: makeToast,
      objectIsEmpty: objectIsEmpty,
      addRightPadding: addRightPadding,
      startWhenDocumentIsReady: startWhenDocumentIsReady
    }
  }();
}

utils_main();




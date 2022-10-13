var BDTLL;

function searchMain() {
  if (window.top != window.self) {
    return;
  }

  BDTLL.search_analyzer = function() {
    // Communication between content-script and background
    function BDTLL_sendRequest(requestJson, callbackFunc) {
      safari.self.addEventListener("message", callbackFunc, false);

      requestJson.url = JSON.stringify(requestJson.url);
      safari.extension.dispatchMessage(requestJson.action, requestJson);
    }

    var count = 0;

    // functie care verifica daca clasa "what" se afla in clasa "where"
    function BDTLL_find_class(where, what) {
      var pos = 0;
      if (where == what) {
        return true; //just what we are looking for
      }
      pos = where.indexOf(what + " ");
      if (pos == 0) {
        return true; //multiple classes starting with the desired one
      }
      pos = where.indexOf(" " + what);
      if (pos != -1 && pos == where.length - what.length - 1) {
        return true; //multiple classes ending with
      }
      pos = where.indexOf(" " + what + " ");
      if (pos != -1) {
        return true; //containing the desired class somewhere between the other classes
      }
      return false;
    }

    // Utility function to add an anchor to lists sent to background script
    function addAnchor(linkList, jsonList, anchor, anchorURL, insertBefore) {
      if (typeof(insertBefore) === "undefined") {
        insertBefore = true;
      }
    
      let obj = {
        "anchor": anchor,
        "insertBefore": insertBefore
      };

      linkList.push(obj);
      jsonList.push({
        "service": "url/status",
        "type": "application/json",
        "data": {
          "url": anchorURL,
        }
      });
    }
    

    let querySelectorsDictionary = {};
    querySelectorsDictionary[BDTLL.consts.SEARCH_GOOGLE] = [
      "a.l",
      ".s > .r > a",
      ".s .VNLkW > .i4vd5e > a",
      ".g > * > .r > a",
      ".g > .r > a",
      ".g > a",
      ".g .zTpPx a",
      ".rc > .r > a",
      ".rc > div > a",
      ".pslimain > .r > a",
      ".gs_rt > a",
      "p > a.on",
      ".vsc .vsta a",
      "li.ads-ad h3 > a:last-child",
      "li > h3 > a[id~=vads]",
      ".DOqJne > g-link > a",
      '#tads      a:not([class*="aob"]):not(div.bOeY0b a):not(div.Qezod a):not(div.Vn4Xqe a):not(div.ifk4y a)',
      '#bottomads a:not([class*="aob"]):not(div.bOeY0b a):not(div.Qezod a):not(div.Vn4Xqe a):not(div.ifk4y a)',
      '#search div.yuRUbf > a', // div.tF2Cxc
      '#search div.M42dy g-link > a',
      '#search div.ct3b9e > a',
    ];
    querySelectorsDictionary[BDTLL.consts.SEARCH_YAHOO] = [
      "div#cols .compTitle h1 a",
      "div#cols .compTitle h2 a",
      "div#cols .compTitle h3 a",
      "div#cols .compTitle h4 a",
      "div#cols .compTitle h5 a",
      "div#cols .compTitle h6 a",
      "div#cols .compList a",
      "div#cols .compText.lh-s a"
    ];
    querySelectorsDictionary[BDTLL.consts.SEARCH_YAHOO_JAPAN] = [
//      "div.hd a",
//      "div.dmn a",
//      "div.fc a",
//      "table.kvp a"
       '#contents__wrap .sw-CardBase .sw-Card__title a'
    ];
    querySelectorsDictionary[BDTLL.consts.SEARCH_BING] = [
      "div.sb_tlst a",
      "div.sn_hd a",
      "div.sb_add h1 a, div.sb_add h2 a, div.sb_add h3 a, div.sb_add h4 a, div.sb_add h5 a, div.sb_add h6 a",
      "div.sa_uc a",
      "div.scs_child_rpr table a",
      "div#ans_news a",
      "li.b_algo h2 a",
      "li.b_algo h3 a",
      "li.b_top h2 a",
      "li.b_top h3 a",
    ];
    querySelectorsDictionary[BDTLL.consts.SEARCH_DUCKDUCKGO] = [
      "a.result__a:not(.related-searches a)"
    ];
    querySelectorsDictionary[BDTLL.consts.SEARCH_ECOSIA] = [
      "div.result a.result-title:not(.related-searches-title)"
    ];
    
    let processFunctionDictionary = {};
    processFunctionDictionary[BDTLL.consts.SEARCH_GOOGLE] = processGoogleAnchor;
    processFunctionDictionary[BDTLL.consts.SEARCH_YAHOO] = processYahooAnchor;
    processFunctionDictionary[BDTLL.consts.SEARCH_YAHOO_JAPAN] = processYahooCoJPAnchor;
    processFunctionDictionary[BDTLL.consts.SEARCH_BING] = processBingAnchor;
    processFunctionDictionary[BDTLL.consts.SEARCH_DUCKDUCKGO] = processDuckduckgoAnchor;
    processFunctionDictionary[BDTLL.consts.SEARCH_ECOSIA] = processEcosiaAnchor;


    function processGenericNode(searchEngine, node, local_link_list, local_json_list) {
      let processFunction = processFunctionDictionary[searchEngine];
      let queries = querySelectorsDictionary[searchEngine];

      for (query of queries) {
        let anchors = node.querySelectorAll(query);
        for (let anchor of anchors) {
          processFunction(local_link_list, local_json_list, query, anchor);
        }
      }
    }

    function processGoogleAnchor(local_link_list, local_json_list, query, anchor) {
      let href;

      if (anchor.hasAttribute("data-preconnect-urls")) {
        href = anchor.dataset.preconnectUrls;
      }
      else {
        let bundledURLRegex = new RegExp(/^\/url\?/i);
        href = anchor.href;

        if (bundledURLRegex.test(anchor.href) && anchor.hasAttribute("data-href")) {
          href = anchor.dataset.href;
        }
      }

      let element = anchor.querySelector("h3");
      if (element !== null) {
        let sp = document.createElement("span");
        element.insertBefore(sp, element.firstChild);
        element = sp;
      }

      element = element || anchor.querySelector("span:not(cite > span):not(span > span)");
      element = element || anchor;
      addAnchor(local_link_list, local_json_list, element, href, true);
    }

    function processYahooAnchor(local_link_list, local_json_list, query, anchor) {
      let URLRegex = /http(?:s)?:\/\/(?:[a-z0-9]{1,3}.)?search.yahoo/i;
      let realURLRegex = /RU=([^\/]*)\//i;
      let href = anchor.href;
    
      let regexMatch = href.match(URLRegex);
      if (regexMatch && regexMatch.length) {
        let realURL = href.match(realURLRegex);
        if (realURL && realURL.length) {
          href = decodeURIComponent(realURL[1]);
        }
      }

      addAnchor(local_link_list, local_json_list, anchor, href, true);
    }

    function processYahooCoJPAnchor(local_link_list, local_json_list, query, anchor) {
      addAnchor(local_link_list, local_json_list, anchor, anchor.href, true);
    }

    function processBingAnchor(local_link_list, local_json_list, query, anchor) {
      addAnchor(local_link_list, local_json_list, anchor, anchor.href, true);
    }

    function processDuckduckgoAnchor(local_link_list, local_json_list, query, anchor) {
      addAnchor(local_link_list, local_json_list, anchor, anchor.href, true);
    }

    function processEcosiaAnchor(local_link_list, local_json_list, query, anchor) {
      addAnchor(local_link_list, local_json_list, anchor, anchor.href, true);
    }
    

    function invalidNode(node) {
      try {
        node.getElementsByTagName("a");
      }
      catch (err) {
        return true;
      }

      return false;
    }

    // get links that are added later to the page
    function BDTLL_newNode(node) {
      if (invalidNode(node)) {
        return;
      }

      let local_link_list = new Array();
      let local_json_list = new Array();
      let searchEngine = BDTLL.utils.get_domain_for_link_scan(window.location.href);
      processGenericNode(searchEngine, node, local_link_list, local_json_list);

      if (local_link_list.length > 0) {
        var initialCount = count;
        count += local_link_list.length;
        BDTLL_scan_links(local_link_list, local_json_list, initialCount);
      }
    }

    // get links that are loaded with the page.
    function BDTLL_get_links() {
      let searchEngine = BDTLL.utils.get_domain_for_link_scan(window.location.href);
      let local_link_list = new Array();
      let local_json_list = new Array();

      processGenericNode(searchEngine, document, local_link_list, local_json_list);
    
      if (local_link_list.length > 0) {
        var initialCount = count;
        count += local_link_list.length;
        BDTLL_scan_links(local_link_list, local_json_list, initialCount);
      }
    }

    //scan_links
    function BDTLL_scan_links(local_link_list, local_json_list, local_count) {
      var domain = BDTLL.utils.get_domain_for_link_scan(document.location.href);
      for (let i = 0; i < local_link_list.length; i++) {
        var id = i + local_count;
        var parent = local_link_list[i].anchor.parentNode;
        var img = document.createElement("img");

        img.id = "TLL_" + id;
        img.style.cursor = "pointer";
        var displayValue = local_link_list[i].anchor.style.display;
        if (typeof(displayValue) === "undefined" || displayValue != "none") {
          // Use inline display if none is available, some images are not added
          // inside a div, they will be misplaced otherwise
          displayValue = "inline";
          // If shown, add a small space between the image and the URL

          if (local_link_list[i].insertBefore) {
            img.style.marginRight = "3px";
          }
          else {
            img.style.marginLeft = "3px";
          }
        }
        img.style.display = displayValue;


        // search engine-specific image positioning
        if (domain == BDTLL.consts.SEARCH_YAHOO) {
          img.style.cssFloat = "left";
          img.style.marginTop = "4px";
        }

        if (domain == BDTLL.consts.SEARCH_ECOSIA) {
          img.style.cssFloat = "left";
          img.style.marginTop = "4px";
        }

        if (domain == BDTLL.consts.SEARCH_YAHOO_JAPAN) {
          img.style.position = "absolute";
          img.style.left = "-20px";
          img.style.top = "4.5px";
        }


        img.setAttribute("data-tll-url", local_json_list[i].data.url);

        let prevSibl = local_link_list[i].anchor.previousElementSibling;
        try {
          if (prevSibl.id.indexOf("TLL") >= 0) {
            local_link_list.splice(i, 1);
            local_json_list.splice(i, 1);
            i--;

            continue;
          }
        }
        catch (err) {  }

        if (local_link_list[i].insertBefore) {
          parent.insertBefore(img, local_link_list[i].anchor);
        }
        else {
          parent.insertBefore(img, local_link_list[i].anchor.nextElementSibling);
        }

        if (domain === BDTLL.consts.SEARCH_DUCKDUCKGO) {
          try {
            // Fit img and link on the same line without changing the size of the
            // container
            local_link_list[i].anchor.style.maxWidth = "95%";
          }
          catch (err) {
            // The a tag might be removed from the DOM in the meantime
          }
        }
      }

      if (local_link_list.length > 0) {
        var request = {
          action: BDTLL.consts.COMMAND_LINK_SCANNER,
          url: local_json_list,
          nr: local_count
        };

        BDTLL_sendRequest(request, BDTLL_onCloudResponse);
      }
    }

    function getPopupElement(popupProductName) {
      let div = document.createElement("div");
      div.innerHTML =
      `
      <div class="BDTLL_Search_Popup">
        <div class="BDTLL_left_box">  </div>

        <div class="BDTLL_right_box">

          <p class="BDTLL_strong BDTLL_title">
            <b>
              <!-- This page is in your Exceptions list -->
            </b>
          </p>

          <p class="BDTLL_mild BDTLL_description">
            <!-- TrafficLight cannot scan it because you added it to your Exceptions list. Go to Settings if you want to remove it. -->
          </p>

          <p class="BDTLL_strong BDTLL_web_protection">
            <span class="BDTLL_before_company">
              <!-- Web Protection by	 -->
            </span>

            <span class="BDTLL_company">
              <b> ${popupProductName} </b>
            </span>

            <span class="BDTLL_after_company">
              <!--  -->
            </span>
          </p>

        </div>

      </div>
      `;

      return div.children[0];
    }

    function getTextsFromStatus(status) {
      let array = new Array();

      switch (status) {
        case 'clean':
          array.push( BDTLL.locales.utils.get_localized_text('popover_title_safe') );
          array.push( BDTLL.locales.utils.get_localized_text('popover_text_safe') );
          break;
        case 'malware':
          array.push( BDTLL.locales.utils.get_localized_text('popover_title_malware') );
          array.push( BDTLL.locales.utils.get_localized_text('popover_text_malware') );
          break;
        case 'phishing':
          array.push( BDTLL.locales.utils.get_localized_text('popover_title_phish') );
          array.push( BDTLL.locales.utils.get_localized_text('popover_text_phish') );
          break;
        case 'fraud':
          array.push( BDTLL.locales.utils.get_localized_text('popover_title_fraud') );
          array.push( BDTLL.locales.utils.get_localized_text('popover_text_fraud') );
          break;
        case 'miner':
          array.push( BDTLL.locales.utils.get_localized_text('popover_title_miner') );
          array.push( BDTLL.locales.utils.get_localized_text('popover_text_miner') );
          break;
        case 'pua':
          array.push( BDTLL.locales.utils.get_localized_text('popover_title_pua') );
          array.push( BDTLL.locales.utils.get_localized_text('popover_text_pua') );
          break;
        case 'untrusted':
          array.push( BDTLL.locales.utils.get_localized_text('popover_title_untrusted') );
          array.push( BDTLL.locales.utils.get_localized_text('popover_text_untrusted') );
          break;
        case 'temp_whitelisted':
          array.push( BDTLL.locales.utils.get_localized_text('popover_title_temp_whitelist') );
          array.push( BDTLL.locales.utils.get_localized_text('popover_text_temp_whitelist') );
          break;
        case 'user_whitelisted':
          array.push( BDTLL.locales.utils.get_localized_text('popover_title_user_whitelist') );
          array.push( BDTLL.locales.utils.get_localized_text('popover_text_user_whitelist') );
          break;
        case 'error':
        default:
          array.push( BDTLL.locales.utils.get_localized_text('popover_title_error') );
          array.push( BDTLL.locales.utils.get_localized_text('popover_text_error') );
          break;
      }

      let regex = /(^.*)\[CompanyName\](.*$)/;
      let webProtectionText = BDTLL.locales.utils.get_localized_text("web_protection");
      result = regex.exec(webProtectionText);
      if (result != null) {
        array.push(result[1]);
        array.push(result[2]);
      }
      else {
        array.push(webProtectionText);
        array.push("");
      }

      return array;
    }

    function getPopupImageUrlFromStatus(status) {
      let url = safari.extension.baseURI + "Resources/img/";
      switch (status) {

        case 'clean':
          url += "search_popup_bd_icon_safe";
          break;

        case 'untrusted':
          url += "search_popup_bd_icon_untrusted";
          break;

        case 'temp_whitelisted': case 'user_whitelisted':
          url += "search_popup_bd_icon_whitelisted";
          break;

        case 'malware': case 'phishing': case 'fraud': case 'miner': case 'pua': case 'error': default:
          url += "search_popup_bd_icon_threat";
          break;
      }

      url += ".pdf";
      // url += ".png";

      return url;
    }


    function getLinkImageUrlFromStatus(status) {
      let url = safari.extension.baseURI + "Resources/img/";
      switch (status) {

        case 'clean':
          url += "search_link_icon_safe";
          break;

        case 'untrusted':
          url += "search_link_icon_untrusted";
          break;

        case 'temp_whitelisted': case 'user_whitelisted':
          url += "search_link_icon_whitelisted";
          break;

        case 'malware': case 'phishing': case 'fraud': case 'miner': case 'pua': case 'error': default:
          url += "search_link_icon_threat";
          break;
      }

      url += ".pdf";
      // url += ".png";

      return url;
    }


    function addPopupForNode(node, status, appearance, popupProductName) {
      let popup = getPopupElement(popupProductName);
      popup.id = node.id + "_popup";
      popup.classList.add(appearance);

      let rect = node.getBoundingClientRect();
      popup.style.left = (rect.left + window.scrollX).toFixed(0) + "px";
      popup.style.top = (rect.top + window.scrollY + 22).toFixed(0) + "px";


      let texts = getTextsFromStatus(status);
      let title = texts[0];
      let description = texts[1];
      let webProtection_before = texts[2];
      let webProtection_after = texts[3];

      popup.querySelector(".BDTLL_title b").textContent = title;
      popup.querySelector(".BDTLL_description").textContent = description;
      popup.querySelector(".BDTLL_before_company").textContent = webProtection_before;
      popup.querySelector(".BDTLL_after_company").textContent = webProtection_after;


      let imageUrl = getPopupImageUrlFromStatus(status);
      popup.querySelector(".BDTLL_left_box").style.backgroundImage = " url(' " + imageUrl + " ') ";
    
      document.body.appendChild(popup);
      node.addEventListener("mouseover", function() {
        let rect = node.getBoundingClientRect();
        popup.style.left = (rect.left + window.scrollX).toFixed(0) + "px";
        popup.style.top = (rect.top + window.scrollY + 22).toFixed(0) + "px";
        
        popup.style.display = "block";
      })
      node.addEventListener("mouseout", function() {
        popup.style.display = "none";
      })
    }

    function setupImageWithResult(imag, status, appearance, openWindowOnClick, popupProductName) {
      imag.setAttribute("src", getLinkImageUrlFromStatus(status));
      imag.style.width = '16px';
      imag.style.height = '16px';

      if (openWindowOnClick) {
        let scannedURL = imag.getAttribute("data-tll-url");
        let localInfo = "https://trafficlight.bitdefender.com/info?url=" + encodeURIComponent(scannedURL);
        imag.onclick = function(event) {
          window.open(localInfo, "_blank");

          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        };
      }

      addPopupForNode(imag, status, appearance, popupProductName);
    }

    //callbackFunc
    function BDTLL_onCloudResponse(responseFromBackground) {
      if (responseFromBackground.name != BDTLL.consts.COMMAND_LINK_SCANNER) {
        return;
      }

      let response = responseFromBackground.message;
      let appearance = response.appearance;
      let openWindowOnClick = response.openWindowOnClick;
      let popupProductName = response.popupProductName;

      if (response.verdict == "err") {
        log.error('Invalid response received ', response);

        for (let i = 0; i < 2000; i++) {
          var id = i;
          var imag = document.getElementById("TLL_" + id);
          if (imag === null) {
            continue;
          }

          let status = "error";
          setupImageWithResult(imag, status, appearance, openWindowOnClick, popupProductName);
        }
      }
      else {
        for (var i = 0; i < response.verdict.length; i++) {
          var id = i + response.nr;
          var imag = document.getElementById("TLL_" + id);

          let status = response.verdict[i].status_message;
          setupImageWithResult(imag, status, appearance, openWindowOnClick, popupProductName);
        }
      }
    }

    function setPopupAppearanceTo(mode) {
      let elements = document.getElementsByClassName("BDTLL_Search_Popup");
      for (elem of elements) {
        elem.classList.remove("light");
        elem.classList.remove("dark");
        elem.classList.add(mode);
      }
    }

    /*******************************************************************************
     * functii ce initiaza scanarea paginilor
     ******************************************************************************/

    function BDTLL_startIfSettingIsOn() {
      let message = {};

      function responseHandler(event) {
        if (event.name == BDTLL.consts.COMMAND_SETTING_SEARCH_ANALYZER && event.message.settingValue === true) {
          log.info("search_analyzer.js started (search analyzer setting is on)");
          BDTLL_start_linkScanner();
        }
      }
    
      safari.self.addEventListener("message", responseHandler);
      safari.extension.dispatchMessage(BDTLL.consts.COMMAND_SETTING_SEARCH_ANALYZER, message);
    }

    function BDTLL_start_linkScanner() {
      count = 0;
      BDTLL_get_links();

      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

      if (MutationObserver) {
        //Use MutationObservers
        var observer = new MutationObserver(function(mutations) {
          var i = 0;
          var ilength = mutations.length;
          for (i = 0; i < ilength; i++) {
            var mutation = mutations[i];
            var j = 0;
            var jlength = mutation.addedNodes.length;
            for (j = 0; j < jlength; j++) {
              BDTLL_newNode(mutation.addedNodes[j]);
            }
          }
        });
        observer.observe(document, {
          childList: true,
          subtree: true
        });
      }
      else {
        //DOM mutation event fallback
        document.addEventListener("DOMNodeInserted", function(evt) {
          BDTLL_newNode(evt.target);
        }, true);
      }
    }

    return {
      startIfSettingIsOn: BDTLL_startIfSettingIsOn,
      addPopupForNode: addPopupForNode,
      setPopupAppearanceTo: setPopupAppearanceTo
    }
  }();

  BDTLL.utils.startWhenDocumentIsReady(function() {
    if (BDTLL.utils.get_domain_for_link_scan(document.URL) !== false) {
      BDTLL.search_analyzer.startIfSettingIsOn();
    }
  });

  function dealWithUpdatePopupAppearanceCommand(event) {
    if (event.name != BDTLL.consts.COMMAND_UPDATE_POPUP_APPEARANCE) {
      return;
    }

    let appearance = event.message.appearance;
    BDTLL.search_analyzer.setPopupAppearanceTo(appearance);
  }

  safari.self.addEventListener("message", dealWithUpdatePopupAppearanceCommand, false);
}

searchMain();


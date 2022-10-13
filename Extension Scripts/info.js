var BDTLL;

function info_main() {
    if (window.top != window.self) {
        return;
    }
    log.info("info.js started");
   
    safari.extension.dispatchMessage(BDTLL.consts.COMMAND_SEND_BROWSER_INFO, {
      "agent": navigator.userAgent,
      "language": navigator.language
    });

    document.addEventListener("visibilitychange", function() {
      safari.extension.dispatchMessage(BDTLL.consts.COMMAND_VISIBILITY_CHANGED, {});
    })
}

info_main();


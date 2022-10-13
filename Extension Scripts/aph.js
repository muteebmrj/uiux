var BDTLL;

function aph_main() {
  if (window.top != window.self) {
    return;
  }
  log.info("aphs.js started"); 
   
  function sendAphRequest() {
    safari.extension.dispatchMessage(BDTLL.consts.COMMAND_APH_REQUEST, {});
  }

  function navigate(event) {
    if (event.name == BDTLL.consts.COMMAND_NAVIGATE_TO) {
      setTimeout(function() {
        let url = event.message.url;
        window.location.href = url;
      }, 2000);
    }
  }

  safari.self.addEventListener("message", navigate);
  sendAphRequest();

  let oldUrl = document.location.href;
  function watchLocation() {
    if (oldUrl != document.location.href) {
      oldUrl = document.location.href;
      sendAphRequest();
    }

    setTimeout(watchLocation, 1000);
  };
  watchLocation();
}

aph_main();


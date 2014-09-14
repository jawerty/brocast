chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if(msg.data) {
      screenX = $(window).width()*msg.data.x;
      screenY = $(window).height()*msg.data.y;

      console.log(screenX +" "+ screenY);
      element = document.elementFromPoint(screenX - window.pageXOffset, screenY + (window.pageYOffset - window.screen.height);
      console.log(element)
      $(element).click()
      sendResponse({ data: 'pong' });
	} else {
	  sendResponse({ data: 'notpong' });
	}
});
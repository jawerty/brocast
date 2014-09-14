chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.data) {
      screenX = $(window).width()*msg.data.x;
      screenY = $(window).height()*msg.data.y;

      console.log(screenX +" "+ screenY + " final");
      element = document.elementFromPoint(screenX - 22, screenY - 64);
      console.log(element)
      $(element).click()
      sendResponse({ data: 'pong' });
	} else {
	  sendResponse({data : 'notpong'})
	}
});
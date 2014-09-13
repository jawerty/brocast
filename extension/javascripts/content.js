chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if(msg.data) {
      screenX = ($(window).width()*msg.data.x);
      screenY = ($(window).height()*msg.data.y);

      console.log("msg: "+msg.data.x+" / msg: "+msg.data.y)
      console.log(screenX +" "+ screenY);
      element = document.elementFromPoint(screenX, screenY);
      console.log(element)
      $(element).click()
      sendResponse({ data: 'pong' });
	}
});
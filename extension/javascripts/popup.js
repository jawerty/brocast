$(document).ready(function() {
	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {
	  	if (request.resultingURL) {
	  		alert("resultingURL: " + request.resultingURL);
	  	}
	});

	$(".play").click(function() {
		var annotationsChecked = $("#annotations_box").prop("checked");
		var remoteControlChecked = $("#remote_control_box").prop("checked")

		chrome.windows.create({'url': 'getURL.html', 'type': 'popup'}, function(window) {});

		chrome.runtime.sendMessage({
			useAnnotations: annotationsChecked,
			useRemoteControl: remoteControlChecked
		});
	});
});
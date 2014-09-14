$(document).ready(function() {
	var playStopButton = $(".playStopButtonContainer").children().first();
	$(".playStopButtonContainer").on("click", ".play", function(e) {
		var annotationsChecked = $("#annotations_box").prop("checked");
		var remoteControlChecked = $("#remote_control_box").prop("checked");

		chrome.runtime.sendMessage({
			cmd: "startShare",
			useAnnotations: annotationsChecked,
			useRemoteControl: remoteControlChecked
		});

	}).on("click", ".stop", function(e) {
		chrome.runtime.sendMessage({
			cmd: "stopStream"
		}, function(){
			playStopButton.addClass("play").removeClass("stop");

			chrome.tabs.query({}, function(tabs) {
			    for (var i = tabs.length - 1; i >= 0; i--) {
			      var tab = tabs[i];
			      chrome.tabs.sendMessage(tab.id, {
			        cmd: "changeAnnotations",
			        showAnnotations: false
			      });
			    };
		    });	
		});
	});

	$(".logo").click(function() {
		chrome.tabs.create({'url': "http://www.brocast.me"}, function(tab){});
	});

	$("footer span").click(function() {
		chrome.tabs.create({'url': "http://www.brocast.me"}, function(tab){});
	});

	chrome.extension.sendRequest({cmd: "play_status"}, function(streaming){
		if (streaming) {
			playStopButton.addClass("stop").removeClass("play");
			$(".form").hide();

		} else {
			playStopButton.addClass("play").removeClass("stop");
			$(".form").show();
			// $("#remoteControlStatus").hide();
		}
	});
});
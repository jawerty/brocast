$(document).ready(function() {
	$(".play").click(function() {
		var annotationsChecked = $("#annotations_box").prop("checked");
		var remoteControlChecked = $("#remote_control_box").prop("checked")

		chrome.runtime.sendMessage({
			useAnnotations: annotationsChecked,
			useRemoteControl: remoteControlChecked
		});
	});
});
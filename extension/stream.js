chrome.storage.sync.get("stream", function(data) {
	stream = data.stream
	var video = document.querySelector("video");
  console.log(video)
    video.src = URL.createObjectURL(stream);
    localstream = stream;
    stream.onended = function() {                    
      console.log("Ended");                          
    };
    document.querySelector('#cancel').addEventListener('click', function(e) {
      if (pending_request_id != null) {
        chrome.desktopCapture.cancelChooseDesktopMedia(pending_request_id);
      }
    });
});
var connection;

function setupRTCMultiConnection(stream) {
    console.log("setupRTC called!");
    alert("SetupRTC called!");
    connection = new RTCMultiConnection();
    
    connection.channel = connection.token();
    
    connection.autoReDialOnFailure = true;

    connection.bandwidth = {
        video: 300 
    };

    connection.session = {
        video: true,
        oneway: true
    };

    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false
    };

    connection.openSignalingChannel = openSignalingChannel;

    connection.dontAttachStream = true;

    connection.attachStreams.push(stream);

    var sessionDescription = connection.open({
        dontTransmit: true
    });

    var domain = 'http://brocastme.herokuapp.com';
    var resultingURL = domain + '/?userid=' + connection.userid + '&sessionid=' + connection.channel;
    chrome.tabs.create({
        url: resultingURL
    });
    console.log("RESULTING URL FROM BACKGROUND: " + resultingURL);
    alert("halt");
    chrome.runtime.sendMessage({resultingURL: resultingURL});
}

var webSocketURI = 'ws://brocast-signalingserver.herokuapp.com';

function openSignalingChannel(config) {
    config.channel = config.channel || this.channel;
    //var websocket = new WebSocket(webSocketURI);
    socket = io.connect(webSocketURI);
    
    socket.on("connect", function(){
      socket.send({
            open: true,
            channel: config.channel
        });
      if (config.callback) config.callback(websocket);
      console.log('WebSocket connection is opened!');
    })
    socket.on("message", function(){
      config.onmessage(JSON.parse(event.data));
    });

    socket.push = socket.send;
    socket.send = function(data) {
        socket.send({
            data: data,
            channel: config.channel
        });
    };
    
    /*websocket.onopen = function() {
        websocket.push(JSON.stringify({
            open: true,
            channel: config.channel
        }));
        if (config.callback) config.callback(websocket);
        console.log('WebSocket connection is opened!');
    };
    websocket.onerror = function() {
        console.error('Unable to connect to ' + webSocketURI);
        if(connection.stats.numberOfConnectedUsers == 0) {
            chrome.runtime.reload();
        }
    };
    websocket.onmessage = function(event) {
        config.onmessage(JSON.parse(event.data));
    };
    websocket.push = websocket.send;
    websocket.send = function(data) {
        websocket.push(JSON.stringify({
            data: data,
            channel: config.channel
        }));
    };*/
}

function gotStream(stream) {
  console.log("Received local stream");
  console.log(stream);

  setupRTCMultiConnection(stream);

  /*$.ajax({ 
      url: "http://localhost:3000", 
      data: "screenshare="+JSON.stringify(stream), 
      success: function(data){
        console.log(data)
      }, 
      type: 'POST', 
      dataType: 'json' 
  });*/

  chrome.storage.sync.set({"stream": stream}, function(data) {
    //chrome.tabs.create({'url': chrome.extension.getURL('stream.html')}, function(tab) {
      //console.log(tab)
    //});

  });
}

function getUserMediaError() {
  console.log("getUserMedia() failed.");
}

function onAccessApproved(id) {
  if (!id) {
    console.log("Access rejected.");
    return;
  }
  navigator.webkitGetUserMedia({
      audio:false,
      video: { mandatory: { chromeMediaSource: "desktop",
                            chromeMediaSourceId: id } }
  }, gotStream, getUserMediaError);
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.useAnnotations && request.useRemoteControl) {
      var socket = io();
      SIGNALING_SERVER = "ws://localhost:3000";
      var channel = location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
      var sender = Math.round(Math.random() * 999999999) + 999999999;

      var pending_request_id = null;

      pending_request_id = chrome.desktopCapture.chooseDesktopMedia(
          ["screen", "window"], onAccessApproved);

      console.log("USING ANNOTATIONS: " + request.useAnnotations);
    }
});
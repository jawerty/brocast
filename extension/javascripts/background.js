function error() {
  console.log('Unable to connect to ' + webSocketURI);
  if(connection.stats.numberOfConnectedUsers == 0) {
      chrome.runtime.reload();
  }
}  
        
var connection;

function setupRTCMultiConnection(stream) {
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

    var domain = 'http://brocast.me';
    var resultingURL = domain + '/?userid=' + connection.userid + '&sessionid=' + connection.channel;

    chrome.windows.create({'url': 'getURL.html', 'type': 'popup', 'width': 350, 'height': 150, 'left': 200, 'top': 200}, function(window) {});
    chrome.runtime.sendMessage({
        resultingURL: resultingURL
    });
}

//'wss://wsnodejs.nodejitsu.com:443'
var webSocketURI = 'ws://brocast-signalingserver.herokuapp.com';

function openSignalingChannel(config) {
    config.channel = config.channel || this.channel;
    var websocket = new WebSocket(webSocketURI);
    websocket.onopen = function() {
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
        console.log(event);
        var coordinates = JSON.parse(event.data);

        cX = coordinates.x;
        cY = coordinates.y;
        videoX = coordinates.vX;
        videoY = coordinates.vY;

        x_percentage = cX/videoX;
        y_percentage = cY/videoY;

        screenX = window.width*e.pageX;
        screenY = window.height*e.pageY;

        console.log(screenX + screenY)
    };
    websocket.push = websocket.send;
    websocket.send = function(data) {
        websocket.push(JSON.stringify({
            data: data,
            channel: config.channel
        }));
    };
    
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
      audio: false,
      video: { mandatory: { chromeMediaSource: "desktop",
                            chromeMediaSourceId: id } }
  }, gotStream, getUserMediaError);
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request.useAnnotations + " " + request.useRemoteControl);
    var socket = io();
    var channel = location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
    var sender = Math.round(Math.random() * 999999999) + 999999999;

    var pending_request_id = null;

    if (request.useRemoteControl) {
      pending_request_id = chrome.desktopCapture.chooseDesktopMedia(
          ["screen"], onAccessApproved);

    } else {
      pending_request_id = chrome.desktopCapture.chooseDesktopMedia(
          ["screen", "window"], onAccessApproved);
    }
});
function error() {
  console.log('Unable to connect to ' + webSocketURI);
  if(connection.stats.numberOfConnectedUsers == 0) {
      chrome.runtime.reload();
  }
}

var connection;
var streaming = false;
var showAnnotations = false;

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

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.cmd == "stopStream") {
        connection.close();
        streaming = false;
        showAnnotations = false;
      }
      sendResponse();
  });


  chrome.windows.create({'url': "getURL.html", 'type': 'popup', 'width': 450, 'height': 200, 'left': 200, 'top': 200}, function(window) {});
  chrome.runtime.sendMessage({
      resultingURL: resultingURL
  });
  _gaq.push(['_trackEvent', "extension background", 'connection established']);

  chrome.tabs.query({}, function(tabs) {
    for (var i = tabs.length - 1; i >= 0; i--) {
      var tab = tabs[i];
      chrome.tabs.sendMessage(tab.id, {
        cmd: "changeAnnotations",
        showAnnotations: showAnnotations
      });
    };
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
        streaming = true;
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

        console.log(x_percentage + " percentage " + y_percentage)
        chrome.tabs.query({active: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {data: {x: x_percentage, y: y_percentage}}, function(response) {
              console.log(response)
            });  
        });
        
    };
    websocket.push = websocket.send;
    websocket.send = function(data) {
        websocket.push(JSON.stringify({
            data: data,
            channel: config.channel
        }));
    };
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if (request.cmd == "stopStream") {
          websocket.close();
          streaming = false;
        }
    });
    
}

function gotStream(stream) {
  console.log("Received local stream");
  console.log(stream);

  setupRTCMultiConnection(stream);
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
    if (request.cmd == "startShare") {

      remote = request.useRemoteControl;
      showAnnotations = request.useAnnotations;

      if (!remote) {
        _gaq.push(['_trackEvent', "extension background", 'annotations disabled']);
      }
      if (!showAnnotations) {
        _gaq.push(['_trackEvent', "extension background", 'remote control disabled']);
      }

      var socket = io();
      var channel = location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
      var sender = Math.round(Math.random() * 999999999) + 999999999;

      var pending_request_id = null;

      pending_request_id = chrome.desktopCapture.chooseDesktopMedia(
          ["screen", "window"], onAccessApproved);
    }

    if (request.data) {
      console.log("got it")
    }
    
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if(request.cmd == "read_file") {
        $.ajax({
            url: chrome.extension.getURL("annotations.html"),
            dataType: "html",
            success: function(html) {
              var drawImageURL = chrome.extension.getURL("images/draw.png");
              var response = {
                html: html,
                showAnnotations: showAnnotations,
                drawImageURL: drawImageURL
              }
              console.log("DRAW drawImageURL:" + drawImageURL);
              sendResponse(response);
            }
        });
    }
})

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if(request.cmd == "play_status") {
        sendResponse(streaming)
    }
    return;
})
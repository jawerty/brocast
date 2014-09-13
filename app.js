
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();



app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


app.get('/', routes.index);


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server);
var fs = require('fs');

io.sockets.on('connection', function(socket) {
  var d = new Date();
  fs.writeFile('log.txt', 'connection reached at: '+d.getTime(), function (err) {
    if (err) return console.log(err);});
  socket.on('message', function(message) {
    var n = new Date();
    fs.writeFile('log.txt', 'message reached at: '+n.getTime(), function (err) {
      if (err) return console.log(err);});
      socket.broadcast.emit('message', message);
  });
});

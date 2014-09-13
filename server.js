var http = require('http');

server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
 socket.on('message', function(message) {
   socket.broadcast.emit('message', message);
 });
});

console.log('Server running at http://127.0.0.1:1337/');
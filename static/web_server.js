#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var connections = [];
var numConnected = 0;
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(11998, function() {
    console.log((new Date()) + 'Intese Defense Server is listening on port 11998');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    connections.push(connection);
	if(numConnected == 0)
		connection.sendUTF('Attacker');
	else if(numConnected == 1)
		connection.sendUTF('Defender');
	else
		connection.sendUTF('Observer');
	numConnected++;
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            for(var i = 0; i<connections.length; i++){
		connections[i].sendUTF(message.utf8Data);
	    }
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            for(var i = 0; i<connections.length; i++){
		connections[i].sendBytes(message.binaryData);
	    }
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
		numConnected--;
    });
});


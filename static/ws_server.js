#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var connections = [];
var killIndexes = [];
var numConnected = 0;
var binaryModifier = 0;
var zombieGroup;
var attackerAvailable = true;
var defenderAvailable = true;
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(11222, function() {
    console.log((new Date()) + 'Intese Defense Server is listening on port 11225');
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
	if(attackerAvailable)
	{
		connection.sendUTF('Attacker');
		attackerAvailable = false;
		connection.role = 0;
	}
	else if(defenderAvailable)
	{
		connection.sendUTF('Defender');
		defenderAvailable = false;
		connection.role = 1;
	}
	else
	{
		connection.sendUTF('Observer');
		connection.role = 2;
	}
	if(!attackerAvailable && !defenderAvailable)
	{
		for(var i = 0; i<connections.length; i++){
					//connections[i].sendUTF('startRound');
					connections[i].sendUTF('defenderPlaceTowers');
				}
	}
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
			if(message.utf8Data.substring(0,1)!= '[' /*&& (message.utf8Data.substring(0,9) == 'addZombie' || message.utf8Data.substring(0,8) == 'addTower')*/)
			{
				//console.log('Received Message: ' + message.utf8Data);
				for(var i = 0; i<connections.length; i++){
					connections[i].sendUTF(message.utf8Data);
				}
			}
			else
			{
				//var zombieGroup = JSON.parse(message.utf8Data);
				var obj = message.utf8Data;
				var zombieStatArray = JSON.parse(obj);
				killIndexes = [];
		        /*for(var x = 0; x<zombieStatArray.length; x++)
				{
					zombieStatArray[x].pos_y +=1;
				}*/
				for (var i=0; i<zombieStatArray.length; i++) {
					//console.log(zombieStatArray[i].pos_x+' '+zombieStatArray[i].pos_y+' '+zombieStatArray[i].speed)
					if (zombieStatArray[i].lane == "center")
					{
						zombieStatArray[i].direction = "down";
						if(zombieStatArray[i].pos_y < 775)
							zombieStatArray[i].pos_y += zombieStatArray[i].speed;
						else
							killIndexes.push(i);
					}
					else if (zombieStatArray[i].lane == "right") // right lane
					{
						if (zombieStatArray[i].pos_x < 742 && zombieStatArray[i].pos_y < 704)
						{
							zombieStatArray[i].direction = "right";
							zombieStatArray[i].pos_x += zombieStatArray[i].speed;
						}
						else if (zombieStatArray[i].pos_x >= 742 && zombieStatArray[i].pos_y < 704)
						{
							zombieStatArray[i].direction = "down";
							zombieStatArray[i].pos_y += zombieStatArray[i].speed;
						}
						else if (zombieStatArray[i].pos_x > 482 && zombieStatArray[i].pos_y >= 704)
						{		
							zombieStatArray[i].direction = "left";
							zombieStatArray[i].pos_x -= zombieStatArray[i].speed;
						}
						else
							zombieStatArray[i].lane = "center";
						}
					else // left lane
					{
						if(zombieStatArray[i].pos_x > 218 && zombieStatArray[i].pos_y < 704)
						{
							zombieStatArray[i].direction = "left";
							zombieStatArray[i].pos_x-=zombieStatArray[i].speed
						}
						else if(zombieStatArray[i].pos_x <= 724 && zombieStatArray[i].pos_y < 704)
						{
							zombieStatArray[i].direction = "down";
							zombieStatArray[i].pos_y+=zombieStatArray[i].speed
						}
						else if(zombieStatArray[i].pos_x < 482 && zombieStatArray[i].pos_y >= 704)
						{	
							zombieStatArray[i].direction = "right";
							zombieStatArray[i].pos_x+=zombieStatArray[i].speed
						}
						else
							zombieStatArray[i].lane = "center";
						}
				}
		
				for(var y = 0; y<connections.length; y++){
				connections[y].sendUTF(JSON.stringify(zombieStatArray));
				}
				//if(killIndexes.length >0)
					//console.log(killIndexes.length);
				if(killIndexes.length >0)
				{
					for(var y = 0; y<connections.length; y++){
					connections[y].sendUTF(JSON.stringify(killIndexes));
					}
				}
					
				//console.log(JSON.stringify(zombieStatArray));
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
		if(connection.role == 0)
			attackerAvailable = true;
		else if(connection.role == 1)
			defenderAvailable = true;
    });
});


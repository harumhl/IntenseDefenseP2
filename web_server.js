var WebSocketServer = require('websocket').server;
var http = require('http');
var express = require('express');
var app = express();
var path = require('path');
var port = process.env.PORT || 12312;

app.use(express.static(__dirname + '/'));


// viewed at http://localhost:8080
app.get('/', function(req, res) {
    console.log('sending file '+__dirname+'/static/index.html');
    res.sendFile(__dirname + '/static/index.html');
});

app.listen((parseInt(port)+parseInt(1)), function(){
    console.log('Example app listening on port '+(parseInt(port)+parseInt(1)));
});

app.set('port', port);
app.portNumber = port;

exports = module.exports = {
  portNumber : port
}



var connections = [];
var killIndexes = [];
var numConnected = 0;
var binaryModifier = 0;
var zombieGroup;
var attackerAvailable = true;
var defenderAvailable = true;
var attackerLoggedIn = false; // these variables control when the timer for placing initial towers start
var defenderLoggedIn = false;
var roleChangedToNumber = 0;
var cooldown = 0;
var continueButtonClicks = 0;
var roundContinueButtonClicks = 0;

var server = http.createServer(
    /*
    function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
}*/app);

process.on('SIGTERM', server.close.bind(server))

server.listen(gPort, function() {
    console.log(new Date());
    console.log('Intese Defense Server is listening on port '+gPort);
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
    connections.push(connection);/*
	if(attackerAvailable)
	{
		connection.sendUTF('attacker');
		attackerAvailable = false;
		connection.role = 0;
	}
	else if(defenderAvailable)
	{
		connection.sendUTF('defender');
		defenderAvailable = false;
		connection.role = 1;
	}
	else
	{
		connection.sendUTF('observer');
		connection.role = 2;
	}
    */
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
		//console.log("message: "+message.utf8Data);
        if (message.type === 'utf8') {
               
            if(message.utf8Data == 'logged in')
            {
                if(!attackerLoggedIn)
                {
                    connection.sendUTF('attacker');
                    attackerLoggedIn = true;
                    connection.role = 0;
                }
                else if(!defenderLoggedIn)
                {
                    connection.sendUTF('defender');
                    defenderLoggedIn = true;
                    connection.role = 1;
                }
                else
                {
                    connection.sendUTF('observer');
                    connection.role = 2;
                }

                if(attackerLoggedIn && defenderLoggedIn)
                {
                     for(var i = 0; i<connections.length; i++){
                        connections[i].sendUTF('defenderPlaceTowers');
                        connections[i].sendUTF('incrementMatch');
                     }
                    attackerLoggedIn = false;
                    defenderLoggedIn = false;
                }
                /*
                //console.log("HERE::"+message.utf8Data.substring(10,18) + "::");
                if(message.utf8Data.substring(10,18) == 'attacker')
                {
                    //console.log("attacker HERE");
                    attackerLoggedIn = true;
                    //console.log("-----> attacker loggin in");
                }
                else if(message.utf8Data.substring(10,18) == 'defender')
                {
                    //console.log("defender HERE");
                    defenderLoggedIn = true;
                    //console.log("-----> defender loggin in");
                }
                
                // if both players are logged in then start the pre-match timer
                */
            }
			else if(message.utf8Data == 'startNewRound'){
				for(var i = 0; i<connections.length; i++){
                        connections[i].sendUTF('defenderPlaceTowers');
                        connections[i].sendUTF('incrementMatch');
                        connections[i].sendUTF('incrementRound');
                }
				
			}
            else if(message.utf8Data == 'incrementClicks'){
				
				continueButtonClicks++;
				console.log("clicks = " + continueButtonClicks);
				if(continueButtonClicks == 2){
					console.log("YES clicks = " + continueButtonClicks);
					continueButtonClicks = 0;
					for(var i = 0; i<connections.length; i++){
						connections[i].sendUTF('startEndRound');
						connections[i].sendUTF('incrementMatch');
					}
				}
			}
			else if(message.utf8Data == 'incrementClicksRound'){
				
				roundContinueButtonClicks++;
				console.log("Roundclicks = " + roundContinueButtonClicks);
				if(roundContinueButtonClicks == 2){
					console.log("YES clicks = " + roundContinueButtonClicks);
					roundContinueButtonClicks = 0;
					for(var i = 0; i<connections.length; i++){
						connections[i].sendUTF('sendNewRound');
					}
				}
			}
            else if(message.utf8Data == 'switchRoles')
            {
                roleChangedToNumber++;
                console.log("roleChangedToNumber: "+roleChangedToNumber);
                  
                if (roleChangedToNumber == 2) {
                  roleChangedToNumber = 0;
                
                  for(var i = 0; i<connections.length; i++)
                    connections[i].sendUTF('switchRoles');
                  }
                }
            else if(message.utf8Data.substring(0,1)!= '[' /*&& (message.utf8Data.substring(0,9) == 'addZombie' || message.utf8Data.substring(0,8) == 'addTower')*/)
			{
				//console.log('Received Message: ' + message.utf8Data);
				for(var i = 0; i<connections.length; i++){
					connections[i].sendUTF(message.utf8Data);
				}
			}
			else
			{
				//var zombieGroup = JSON.parse(message.utf8Data);
				//console.log("elsese");
				var obj = message.utf8Data;
				var zombieStatArray = JSON.parse(obj);
				var baseDamage = 0;
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
						if(zombieStatArray[i].pos_y < 775) {
							zombieStatArray[i].pos_y += zombieStatArray[i].speed;
						}
						else 
						{
							if(cooldown == 0){
								console.log(i+' '+zombieStatArray[i].damage);
								baseDamage += zombieStatArray[i].damage;
								killIndexes.push(i);
							}
							else 
								cooldown--;
						}
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
						else { // the last part to go down towards the base
							zombieStatArray[i].lane = "center";
							zombieStatArray[i].direction = "down";
						}
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
						else { // the last part to go down towards the base
							zombieStatArray[i].lane = "center";
							zombieStatArray[i].direction = "down";
						}
					}
				}
		
				for(var y = 0; y<connections.length; y++){
				connections[y].sendUTF(JSON.stringify(zombieStatArray));
				}
				//if(killIndexes.length >0)
					//console.log(killIndexes.length);
				if(killIndexes.length > 0)
				{
					for(var y = 0; y<connections.length; y++){
						connections[y].sendUTF(JSON.stringify(killIndexes));
						connections[y].sendUTF('baseDamage'+baseDamage);
					}
					baseDamage = 0;
					cooldown = 10;
					killIndexes = [];
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
        {
			attackerAvailable = true;
            attackerLoggedIn = false;
        }
		else if(connection.role == 1)
        {
			defenderAvailable = true;
            defenderLoggedIn = false;
        }
    });
});


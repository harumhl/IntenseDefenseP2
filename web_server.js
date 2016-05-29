// intensedefense.heroku.com - can be awake up to 18 hours every 24 hours 
// (after 30 mins inactivity, it goes to sleep. accessing it awakes the program)
 
// git pull && git push heroku master && heroku ps:scale web=1 && heroku open (on Terminal)
//	git pull from github.com/harumhl/IntenseDefenseP2
//	git push heroku master is pushing it to github.heroku.com (this part actually changes and updates the website)
//	heroku ps:scale web=1 making one website available - making it 0 leads to "error" page
//	heroku open for running it
// heroku ps -a intensedefense - to check quota of awake time

// To block people from accessing it, 
//	1. heroku ps:scale web=0 (on Terminal)
//	or 2. heroku maintenance:on (on Terminal) (it does same thing as #3)
//	or 3. turn on maintenance mode @https://dashboard.heroku.com/apps/intensedefense/settings
// To undo it,
//	1. heroku ps:scale web=1 (on Terminal)
//	2. heroku maintenance:off (on Terminal)
//	3. turn off maintenance mode @https://dashboard.heroku.com/apps/intensedefense/settings

var WebSocketServer = require('websocket').server;
var http = require('http');
var express = require('express');
var app = express();
var path = require('path');
var port = process.env.PORT || 1357; 

app.use(express.static(__dirname + '/'));

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    console.log('sending file '+__dirname+'/static/index.html');
    res.sendFile(__dirname + '/static/index.html');
});
/*
app.listen((parseInt(port)+parseInt(1000)), function(){
    console.log('Example app listening on port '+(parseInt(port)+parseInt(1)));
});*/


var connections = [];
var gameIndex = -1;
var killIndexes = [];
var numConnected = 0;
var binaryModifier = 0;
var zombieGroup;
var attackerAvailable = true;
var defenderAvailable = true;
var attackerInfo = "";
var defenderInfo = "";
var attackerConnection;
var defenderConnection;
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


server.listen(port, function() {
    console.log(new Date());
    console.log('Intese Defense Server is listening on port '+port);
});
process.on('SIGTERM', server.close.bind(server))

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

wsServer.on('request', function(request) { // instead of 'request'
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    
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
                    attackerConnection = connection;
                    connection.role = 0;
                }
                else if(!defenderLoggedIn)
                {
                    connection.sendUTF('defender');
                    defenderLoggedIn = true;
                    defenderConnection = connection;
                    connection.role = 1;
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
            else if(message.utf8Data == 'matchNeededAgain') {
                gameIndex = findGameByPlayer(connection);
                
                if (connections[connections.length-1].length == 1) {
                    // If there's another player waiting, then connect those two
                    connection.role = 1;
                    connections[connections.length-1].push(connection);
                    connections.splice(gameIndex,1);
                    
                    for(var i=0; i < connections[connections.length-1].length; i++){                    
                        connections[connections.length-1][i].sendUTF('defenderPlaceTowers');
                        connections[gameIndex][i].sendUTF('incrementMatch');
                    }
                }
                else {
                    // If there isn't another player waiting, then make the player wait
                    connection.role = 0;
                    connections.push([connection]);
                    connections.splice(gameIndex,1);
                }
            }
			else if(message.utf8Data == 'startNewRound'){
                gameIndex = findGameByPlayer(connection);
                    
                for(var i=0; i < connections[gameIndex].length; i++){
                        connections[gameIndex][i].sendUTF('defenderPlaceTowers');
                        connections[gameIndex][i].sendUTF('incrementMatch');
                        connections[gameIndex][i].sendUTF('incrementRound');
                }
				
			}
            else if(message.utf8Data == 'incrementClicks'){
				
				continueButtonClicks++;
				console.log("clicks = " + continueButtonClicks);
				if(continueButtonClicks == 2){
					console.log("YES clicks = " + continueButtonClicks);
					continueButtonClicks = 0;
                    
                    gameIndex = findGameByPlayer(connection);

                    for(var i=0; i < connections[gameIndex].length; i++){
						connections[gameIndex][i].sendUTF('startEndRound');
						connections[gameIndex][i].sendUTF('incrementMatch');
					}
				}
			}
			else if(message.utf8Data == 'incrementClicksRound'){
				
				roundContinueButtonClicks++;
				console.log("Roundclicks = " + roundContinueButtonClicks);
				if(roundContinueButtonClicks == 2){
					console.log("YES clicks = " + roundContinueButtonClicks);
					roundContinueButtonClicks = 0;

                    gameIndex = findGameByPlayer(connection);

                    for(var i=0; i < connections[gameIndex].length; i++){                    
						connections[gameIndex][i].sendUTF('sendNewRound');
					}
				}
			}
            else if(message.utf8Data == 'switchRoles')
            {
                roleChangedToNumber++;
                console.log("roleChangedToNumber: "+roleChangedToNumber);
                  
                if (roleChangedToNumber == 2) {
                  roleChangedToNumber = 0;
                
                gameIndex = findGameByPlayer(connection);

                for(var i=0; i < connections[gameIndex].length; i++){
                    connections[gameIndex][i].sendUTF('switchRoles');
                  }
                }
            }
            else if(message.utf8Data == 'startRound' ||
                    message.utf8Data.substring(0,9) == 'addZombie' ||
                    message.utf8Data.substring(0,8) == 'addTower') {
                gameIndex = findGameByPlayer(connection);

                for(var i=0; i < connections[gameIndex].length; i++){
                    connections[gameIndex][i].sendUTF(message.utf8Data);
                }
            }
            else if(message.utf8Data.substring(0,1) != '[')
			{
				console.log('Received Message: ' + message.utf8Data);
                
                if (message.utf8Data.substring(0,12) == 'attackerName') {
                    connections.push([connection]);
                    attackerInfo = message.utf8Data;
                    console.log("new game"+connections[connections.length-1].length);
                }
                else if (message.utf8Data.substring(0,12) == 'defenderName') {
                    
                    for (var i=0; i < connections.length; i++) {
                        if (connections[i].length == 1) {
                            connections[i].push(connection);
                            defenderInfo = message.utf8Data;
                            console.log("added to current game"); 
                        }
                    }
                }
                /*
                if (connections.length == 0 || connections[connections.length-1].length == 2) {
                    // Nobody playing the game or even number of players so far --> create a new game
                    connections.push([connection]);
                    attackerInfo = message.utf8Data;
                    console.log("new game"+connections[connections.length-1].length);
                }
                else if (connections[connections.length-1].length == 1) { 
                    // The last game has one player --> add this new player to that game
                    connections[connections.length-1].push(connection);
                    defenderInfo = message.utf8Data;
                    console.log("added to current game"); 
                }
                else {
                    console.log("i dont know"+connections.length+"_"+connections[connections.length-1].length);
                }*/

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
					//console.log("move @"+i+" moving by "+zombieStatArray[i].speed);
				}
		
                gameIndex = findGameByPlayer(connection);

                for(var i=0; i < connections[gameIndex].length; i++){
					connections[gameIndex][i].sendUTF(JSON.stringify(zombieStatArray));
				}
				//if(killIndexes.length >0)
					//console.log(killIndexes.length);
				if(killIndexes.length > 0)
				{
                    gameIndex = findGameByPlayer(connection);

                    for(var i=0; i < connections[gameIndex].length; i++){
						connections[gameIndex][i].sendUTF(JSON.stringify(killIndexes));
						connections[gameIndex][i].sendUTF('baseDamage'+baseDamage);
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
            gameIndex = findGameByPlayer(connection);

            for(var i=0; i < connections[gameIndex].length; i++){
                connections[gameIndex][i].sendBytes(message.binaryData);
	       }
        }
        
        if(attackerLoggedIn && defenderLoggedIn && attackerInfo != "" && defenderInfo != "" &&
          (attackerConnection == connection || defenderConnection == connection))
        {
            // ALL DONE WHEN ATTACKER and DEFENDER NAMES ARE ASSIGNED
            /*
            if (connections.length == 0 || connections[connections.length-1].length == 2) {
                // Nobody playing the game or even number of players so far --> create a new game
                connections.push([connection]);
                console.log("new game"+connections[connections.length-1].length);
            }
            else if (connections[connections.length-1].length == 1) { 
                // The last game has one player --> add this new player to that game
                connections[connections.length-1].push(connection);
                console.log("added to current game"); 
            }
            else {
                console.log("i dont know"+connections.length+"_"+connections[connections.length-1].length);
            }
            */
            for (var i=0; i < connections.length; i++)
                console.log("\n\n\nconnection @"+i +": size of "+connections[i].length +"\n\n\n");

            gameIndex = findGameByPlayer(connection);

             for(var i = 0; i < connections[gameIndex].length; i++){
                 console.log(attackerInfo +"___"+defenderInfo);
                 connections[gameIndex][i].sendUTF(attackerInfo);
                 connections[gameIndex][i].sendUTF(defenderInfo);

                 connections[gameIndex][i].sendUTF('defenderPlaceTowers');
                 connections[gameIndex][i].sendUTF('incrementMatch');                         
             }
            attackerLoggedIn = false;
            defenderLoggedIn = false;
            attackerInfo = "";
            defenderInfo = "";
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
        
        // taking the 'connection' off of 'connections' array
        // also sending a message to verify whether the server should connect the player with another
        gameIndex = findGameByPlayer(connection);

        if (connections == undefined || connections[gameIndex] == undefined) 
            return;
        
        for (var i=0; i < connections[gameIndex].length; i++) {
            if (connections[gameIndex][i] == connection) {
                connections[gameIndex].splice(i,1);
                continue;
            }
            
            connections[gameIndex][i].sendUTF('AnotherPlayerLeft');            
        }
    });
});

function findGameByPlayer(player) {
    for (var i=0; i < connections.length; i++) {
        // if the player is a player (either attacker or defender) of the game, then return game index
        if (connections[i][0] == player || connections[i][1] == player)
            return i;
    }
    return -1;
}

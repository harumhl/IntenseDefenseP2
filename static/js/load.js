/*
	load.js
	
	- load all images spritesheets
	- create the sokcet connection (this is outside of the loadState definition)
*/
//alert('load');
var loadState =
{
	preload: function()
	{
		console.log('STATE: load');
		
		
		game.load.image('title','images/Title.png');
		game.load.spritesheet('map','images/mapSpriteSheet.png', 700,735);
		game.load.image('base','images/base.png');
		game.load.image('bottomUpgradeBox', 'images/BottomInfoBox/bottomBoxnew.png')
		
		/* images for buttons */
		//zombie path button
		game.load.spritesheet('zombiePathButton', 'images/generalButtons/zombiePathButton.png', 50,50);
		//zombies
		game.load.spritesheet('standardZombieButton', 'images/Zombies/zombieStandardButtonSpt.png', 70, 70);
		game.load.spritesheet('strongZombieButton', 'images/Zombies/zombieStrongButtonSpt.png', 70,70);
		game.load.spritesheet('healingZombieButton', 'images/Zombies/zombieHealingButtonSpt.png', 70,70);
		game.load.spritesheet('generationsZombieButton', 'images/Zombies/zombieGenerationsButtonSpt.png', 70,70);
		// image displayed instead of button if player cant afford it
		game.load.image('zombieBankrupt', 'images/Zombies/zombieBankrupt.png');
		
		//tower buttons
		game.load.spritesheet('minigunTowerButton', 'images/Towers/towerMinigunButtonSpt.png', 70, 70);
		game.load.spritesheet('shotgunTowerButton', 'images/Towers/towerShotgunButtonSpt.png', 70, 70);
		game.load.spritesheet('gumTowerButton', 'images/Towers/towerGumButtonSpt.png', 70, 70);
		game.load.spritesheet('bombTowerButton', 'images/Towers/towerBombButtonSpt.png', 70, 70);
		// image displayed instead of button if player cant afford it
		game.load.image('minigunBankrupt', 'images/Towers/minigunBankrupt.png');
		game.load.image('shotgunBankrupt', 'images/Towers/shotgunBankrupt.png');
		game.load.image('gumBankrupt', 'images/Towers/gumBankrupt.png');
		game.load.image('bombBankrupt', 'images/Towers/bombBankrupt.png');
		
		
		/* images for the actual objects on the map */
		//towers
		game.load.spritesheet('minigunTower', 'images/Towers/towerStandard.png');
		game.load.spritesheet('shotgunTower', 'images/Towers/towerShotgun.png');
		game.load.spritesheet('gumTower', 'images/Towers/towerGum.png');
		game.load.spritesheet('bombTower', 'images/Towers/towerBomb.png');
		
		game.load.spritesheet('standardZombie', 'images/Zombies/zombieStandard.png', 57,75);
		game.load.spritesheet('strongZombie', 'images/Zombies/zombieStrong.png', 57, 75);
		game.load.spritesheet('healingZombie', 'images/Zombies/zombieHealing.png', 57, 75);
		game.load.spritesheet('generationsZombie', 'images/Zombies/zombieGenerations.png', 57, 75);
		
		// bullet used for now to shoot from the towers, image will be changed later
		game.load.image('bullet', 'images/bullet.png');
		
		//curtain for the attacker, so attacker wont see where defender is placing towers for 30 seconds
		game.load.spritesheet('attckerCurtain', 'images/attackerCurtain.png');
		//curtain for both players, When first loggin in will be presented this image hiding the map 
		game.load.spritesheet('matchmakingCurtain', 'images/matchmaking.png');
		
		game.load.image('zombieSpawn', 'images/zombieSpawn.png');
        
        // Spritesheets for upgrading a zombie
        game.load.spritesheet('upgradeLvl1', 'images/BottomInfoBox/upgradeLvl1.png', 90, 25);
        game.load.spritesheet('upgradeLvl2', 'images/BottomInfoBox/upgradeLvl2.png');
        game.load.spritesheet('upgradeLvl3', 'images/BottomInfoBox/upgradeLvl3.png');
		
	},
	
	create: function()
	{
		game.state.start('login');
	}
};





/*    Sockets       */



window.onload = function() {
    var playerName = prompt("Please enter your username:", "username");
    
  // Create a new WebSocket.
  socket = new WebSocket('ws://compute.cse.tamu.edu:11223', "echo-protocol");

    
  // Handle messages sent by the server.
  socket.onmessage = function(event) {
	  var message = event.data;
	 // var type = 'string';
		if(message == 'Attacker'){
			state = 'attacker';
			console.log(state);
			//document.getElementById("state").innerHTML = "Attacker";
            player = new Player(playerName, state, 2000);
            console.log(player.username + ' ' + player.state);
            document.getElementById("attacker-name").innerHTML = "Attacker: " + player.username;
		}
		else if(message == 'Defender'){
			state = 'defender';
			console.log(state);
			//document.getElementById("state").innerHTML = "Defender";
             player = new Player(playerName, state, 1000);
            console.log(player.username + ' ' + player.state);
            document.getElementById("defender-name").innerHTML = "Defender: " + player.username;
		}
		else if(message == 'Observer'){
			state = 'observer';
			console.log(state);
			//document.getElementById("state").innerHTML = "Observer";
            player = new Player(playerName, state, 2000);
            console.log(player.username + ' ' + player.state);
		}
		else if(message.length > 9 && message.substring(0,9) == 'addZombie')
			buyZombie(message.substring(9, message.length));
		else if(message == 'incoming')
			incoming = true;
		else if(message.substring(0,13) == 'defenderMoney'){
			if(state == 'defender')
				player.money+=parseInt(message.substring(14,message.length));
		}
		else if(message.length > 8 && message.substring(0,8) == 'addTower')
		{
			var commaCounter = 0;
			var towerType = '';
			var pos_x = '';
			var pos_y = '';		
			for(i = 0; i<message.length; i++)
			{
				if(commaCounter<1)
				{
					if(message[i] == ',')
						commaCounter++			
				}			
				else if(commaCounter == 1)
				{
					if(message[i] != ',')
						towerType += message[i];
					else
						commaCounter++;			
				}
				else if(commaCounter == 2)
				{
					if(message[i] != ',')
						pos_x += message[i];
					else
						commaCounter++;			
				}
				else
					pos_y+=message[i];
				
			}
			towerArray.push(new Tower(towerType, pos_x, pos_y));
			
		}
        else if(message == "startRound")
        {
            // destroy the curatin and bring the tower sprites to the front so the attacker can see them now
            if(player.state == 'attacker'){
                attackerCurtain.destroy();
                for (var i=0; i< towerArray.length; i++)
                    towerArray[i].image.bringToTop();
            }
            
            console.log("recieved start round");
            startRound = true;
            countdown(5);
        }
        else if(message.substring(0,12) == 'attackerName')
        {
            attackerName = message.substring(13, message.length);
            document.getElementById("attacker-name").innerHTML = "Attacker: " + attackerName;
        }
        else if(message.substring(0,12) == 'defenderName')
        {
            defenderName = message.substring(13, message.length);
            document.getElementById("defender-name").innerHTML = "Defender: " + defenderName;
        }
        else if(message == "defenderPlaceTowers")
        {
            console.log("defenderplacetowers");
 
            if(player.state == 'attacker'){
                matchmakingCurtain.destroy();
                attackerCurtain = game.add.sprite(0,129,'attckerCurtain');
            }
            
            socket.send(player.state + 'Name ' + player.username);
            console.log("Defender start placing towers!");
            countdown(.31); // extra second for login time
        }
		else
		{
			var receivedArray = JSON.parse(message);
			if(typeof(receivedArray[0]) == 'number'){
				for(var i = 0; i<receivedArray.length; i++)
					damageBase(receivedArray[i]);
			}
			else{
				if(receivedArray.length == zombieStatArray.length){
						zombieStatArray = receivedArray;
					for(var i = 0; i<zombieStatArray.length; i++) {
						zombieArray[i].move(zombieStatArray[i].pos_x, zombieStatArray[i].pos_y, zombieStatArray[i].direction);        
					}
				}
			}
		}
	}
}
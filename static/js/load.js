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
		game.load.spritesheet('map','images/NEWmapSpriteSheet.png', 700,735);
		game.load.spritesheet('base','images/BottomInfoBox/baseSpt.png',110,83);
		game.load.image('bottomUpgradeBox', 'images/BottomInfoBox/bottomBoxnew.png')
		
        /*stuff for login state*/
        game.load.spritesheet('instructionsButton', 'images/generalButtons/instructionsButton.png',200,100);
        game.load.spritesheet('closeInstructionsButton', 'images/generalButtons/closeInstructionsButton.png',200,100);
		game.load.spritesheet('attackerInstructionButton', 'images/generalButtons/attackerInstructionButton.png',200,100);
		game.load.spritesheet('defenderInstructionButton', 'images/generalButtons/defenderInstructionButton.png',200,100);
        //game.load.image('instructionSheet', 'images/instructionSheet.png');
		game.load.spritesheet('instructionSheet', 'images/instructionSheetSpt.png',1000,1136);
        game.load.spritesheet('loginButton', 'images/loginButton.png',200,100);
		game.load.spritesheet('loginButton', 'images/loginButton.png',200,100);
        
        
        
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
		game.load.spritesheet('minigunTower', 'images/Towers/towerMinigun.png');
		game.load.spritesheet('shotgunTower', 'images/Towers/towerShotgun.png');
		game.load.spritesheet('gumTower', 'images/Towers/towerGum.png');
		game.load.spritesheet('bombTower', 'images/Towers/towerBomb.png');
        game.load.image('attackRange', 'images/Towers/attackRange.png');
		
		game.load.spritesheet('standardZombie', 'images/Zombies/zombieStandard.png', 57,75);
		game.load.spritesheet('strongZombie', 'images/Zombies/zombieStrong.png', 57, 75);
		game.load.spritesheet('healingZombie', 'images/Zombies/zombieHealing.png', 57, 75);
		game.load.spritesheet('generationsZombie', 'images/Zombies/zombieGenerations.png', 57, 75);
		
		// bullet used for now to shoot from the towers, image will be changed later
		game.load.image('minigunBullet', 'images/minigunBullet.png');
        game.load.image('shotgunBullet', 'images/shotgunBullet.png');
        game.load.image('gumBullet', 'images/gumBullet.png');
        game.load.image('bombBullet', 'images/bombBullet.png');
        game.load.spritesheet('explosion', 'images/explosion.png');
		
		//curtain for the attacker, so attacker wont see where defender is placing towers for 30 seconds
		game.load.spritesheet('attckerCurtain', 'images/attackerCurtain.png');
		//curtain for both players, When first loggin in will be presented this image hiding the map 
		game.load.spritesheet('matchmakingCurtain', 'images/matchmaking.png');
		
		game.load.image('zombieSpawn', 'images/zombieSpawn.png');
        
        /*   Bottom infor box spritesheets   */  
        // Spritesheets for upgrading a zombie
        game.load.spritesheet('upgradeLvl1', 'images/BottomInfoBox/upgradeLvl1.png', 90, 25);
        game.load.spritesheet('upgradeLvl2', 'images/BottomInfoBox/upgradeLvl2.png', 90, 25);
        game.load.spritesheet('upgradeLvl3', 'images/BottomInfoBox/upgradeLvl3.png', 90, 25);
        game.load.image('upgradeMax', 'images/BottomInfoBox/upgradeMax.png');
        game.load.spritesheet('baseHealth', 'images/BottomInfoBox/baseHealth.png', 297,63); // Total 14 frames
		
		/* stuff for matchResults state */
        game.load.image('winner', 'images/endMatch/winner.png');
        game.load.image('loser', 'images/endMatch/loser.png');
        game.load.image('tie', 'images/endMatch/tie.png');
        game.load.spritesheet('continueButton', 'images/endMatch/continue.png', 200, 100);
        game.load.image('checkmark', 'images/endMatch/checkmark.png');

        // aduio
		game.load.audio('gameMusic', 'audio/bensound-epic.mp3');

		//mute button
		game.load.spritesheet('mute', 'images/generalButtons/musicButton.png', 50,50);
		
	},
	
	create: function()
    {
		game.state.start('login');
	}
};





/*    Sockets       */



window.onload = function() {
    
  // Create a new WebSocket.
  var host = location.origin.replace(/^http/, 'websocket');
  socket = new WebSocket(host);
//  socket = new WebSocket('ws://compute.cse.tamu.edu:11099', "echo-protocol");
  var lockout = 0;
    
  // Handle messages sent by the server.
  socket.onmessage = function(event) {
	  var message = event.data;
	 // var type = 'string';
      // console.log("M@" + new Date() + ": " + message);
		if(message == 'attacker' || message == 'defender'){
			state = message;
			console.log(state);
		}
		else if(message == 'observer'){
			state = 'observer';
			console.log(state);
		}
		else if(message.length > 9 && message.substring(0,9) == 'addZombie'){
			var zombieType = message.substring(9, message.length);
			buyZombie(zombieType);
			zombieCount[zombieType] += 1;
		}
		else if(message == 'sendNewRound'){
			if(player.state == 'attacker'){
				startNewMatch();
			}
			else{
				
				console.log('WAITTTTTTTT');
				setTimeout(startNewMatch(), 2000);
			}
		}
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
			towerCount[towerType] += 1;
		}
        else if (message == 'switchRoles') {
            if      (player.state == 'attacker') player.state = 'defender';
            else if (player.state == 'defender') player.state = 'attacker';
            
            console.log("switchRole: "+player.state);
            roleSwitched = true;
        }
		else if (message == 'incrementMatch') {
			console.log("++++++++++++ MATCH");
            roundMatchNum['match'] += 1;
        }
		else if (message == 'incrementRound'){
			console.log("++++++++++++ Round");
			roundMatchNum['round'] += 1;
		}
        else if(message == "startEndRound"){
			startEndRound = true;
			if(startEndRound) console.log("SET TO TRUEEEEE");
	}
        else if (message == 'addCheckDef') {
            if(roundMatchNum['match'] == 1){
				checkone = game.add.image(165,975, 'checkmark');
				checkone.scale.setTo(0.5);
			}
			else{
				//if(continueButton != undefined) continueButton.destroy();
				//continueClicks++;
				//socket.send("incrementClicks");
				checktwo = game.add.image(650,975, 'checkmark');
				checktwo.scale.setTo(0.5);
			}
        }
        else if (message == 'addCheckAtt') {
      		if (roundMatchNum['match'] == 1){
				checktwo = game.add.image(650,975, 'checkmark');
				checktwo.scale.setTo(0.5);
			
				continueButton = game.add.button(405,975, 'continueButton',function(){
					console.log("BEFORE");
					if(player.state == 'attacker')
						socket.send('addCheckAtt');
					else if(player.state == 'defender')
						socket.send('addCheckDef');
					
					continueClicked = true;
					
				}, this, 0, 1, 2);
			}
			else{
				//if(continueButton != undefined) continueButton.destroy();
				//continueClicks++;
				//socket.send("incrementClicks");
				checkone = game.add.image(165,975, 'checkmark');
				checkone.scale.setTo(0.5);
			}
        }
        else if(message == "startRound")
        {
		
			if(!alreadyStarted){
				alreadyStarted = true;
				// destroy the curatin and bring the tower sprites to the front so the attacker can see them now
				if(player.state == 'attacker'){
					 if(attackerCurtain != undefined)
						attackerCurtain.destroy();
					for (var i=0; i< towerArray.length; i++)
						towerArray[i].image.bringToTop();
				}
				
				console.log("recieved start round");
				startRound = true;
				countdown(5);
			}
        }
        else if(message.substring(0,12) == 'attackerName')
        {
			console.log("HERE");
            attackerName = message.substring(13, message.length);
			playerNames['attacker'] = attackerName;
            //document.getElementById("attacker-name").innerHTML = "Attacker: " + attackerName;
        }
        else if(message.substring(0,12) == 'defenderName')
        {
            defenderName = message.substring(13, message.length);
			console.log('LOAD def name: ' + defenderName );
			playerNames['defender'] = defenderName;
			console.log('LOAD def name: ' + playerNames['defender'] );

            //document.getElementById("defender-name").innerHTML = "Defender: " + defenderName;
        }
        else if(message == "defenderPlaceTowers")
        {
            console.log("defenderplacetowers");
            defenderPlaceTowers = true;
			attackerWon = false;
		// causes error on defender side, but the block of code does not
		// effect the defenders page at all
                if(player.state == 'attacker'){
                    attackerCurtain = game.add.image(144,129,'attckerCurtain');
					console.log("ADD THE CURTAIN");
					attackerCurtain.bringToTop();
					if(attackerCurtain.exists)console.log("--ADD THE CURTAIN");
					if(matchmakingCurtain != undefined)
					matchmakingCurtain.destroy();
                }

                socket.send(player.state + 'Name ' + player.username);
                console.log("Defender start placing towers!");
                countdown(0.30); // extra second for login time
            
        }
        else if(message.substring(0,7) == "upgrade")
        {
            console.log("upgradeee");
            var submessage = message.split(":");
            var posX = submessage[1];
            var posY = submessage[2];
            var towerType = submessage[3];
            //console.log(submessage);
            console.log("X: "+posX+" Y:"+posY+" type:" +towerType);

            for(i = 0; i <towerArray.length; i++){
                if(towerArray[i].pos_x == posX){
                    if(towerArray[i].pos_y == posY){
                        if(towerArray[i].type == towerType)
                        {
                            if(message.substring(8,17) == "fire rate")
                                towerArray[i].upgradeFireRate();
                            if(message.substring(8,19) == "damage rate")
                                towerArray[i].upgradeDamage();
                        }
                    }
                }
            }
        }
		else if(message.substring(0,10) == 'baseDamage'){
			//console.log('damaging base '+message.substring(10, message.length));
			damageBase(message.substring(10, message.length))
		}
		else
		{
			var receivedArray = JSON.parse(message);
			if(typeof(receivedArray[0]) == 'number'){
				for(var i = 0; i<receivedArray.length; i++)
					cleanseZombie(receivedArray[i]);
			}
			else{
				if(receivedArray.length == zombieStatArray.length || lockout > 10){
						zombieStatArray = receivedArray;
						lockout = 0;
					for(var i = 0; i<zombieStatArray.length; i++) {
						zombieArray[i].move(zombieStatArray[i].pos_x, zombieStatArray[i].pos_y, zombieStatArray[i].direction);        
					}
				}
				else
				{
					console.log(lockout);
					lockout++;
				}
			}
		}
	}
}

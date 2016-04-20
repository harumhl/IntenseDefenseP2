/* play.js */




/*
	- at end of match (i.e. endRound('attacker') ) we have to call the 'matchResults' game state
			-> game.state.start('matchResults');


*/


var onlyOnce = 0;
var playMatchState = 
{
	create: function()
	{
		
		console.log('STATE:Play');
        rescale();
        matchNum++;
        matchOver = false;
        roleSwitched = false;
        winner = '';
        baseHealth = 2000;
        if (player.state == 'attacker') player.money = 2000;
        if (player.state == 'defender') player.money = 1000;

		//load images on the background
		game.stage.backgroundColor = "#e5e1db"; // gray background color
		game.add.sprite(0,0,'title');
        //load images for bottom upgrade box
        bottomUpgradeBox = game.add.sprite(144, 890, 'bottomUpgradeBox');
        
		map = game.add.sprite(144,129,'map');
		map.animations.add('plainMap', [0], true);
		map.animations.add('towerPlacement', [1], true);
		map.play('plainMap');
		map.inputEnabled = true;
		map.events.onInputDown.add(mouseClick, this);
		
		/*Creating each button*/
		// Zombie Buttons
        buttons['standard'] = game.add.button(40, 160, 'standardZombieButton', function(){
                                              sendAddZombie("standard");}, this, 0, 1, 2);
        buttons['strong']  =  game.add.button(40, 320, 'strongZombieButton', function(){
                                               sendAddZombie("strong");}, this, 0, 1, 2);
        buttons['healing']  =  game.add.button(40, 480, 'healingZombieButton', function(){
                                                sendAddZombie("healing");}, this, 0, 1, 2);
        buttons['generations']  =  game.add.button(40, 640, 'generationsZombieButton', function(){
                                                    sendAddZombie("generations");}, this, 0, 1, 2);
        // Tower Buttons
        buttons['minigun']  =  game.add.button(870, 160, 'minigunTowerButton', function(){
                                                buyTower("minigun");}, this, 0, 1, 2);
        buttons['shotgun']  =  game.add.button(870, 320, 'shotgunTowerButton', function(){
                                                buyTower("shotgun");}, this, 0, 1, 2);
        buttons['gum']  =  game.add.button(870, 480, 'gumTowerButton', function(){
                                            buyTower("gum");}, this, 0, 1, 2);
        buttons['bomb']  =  game.add.button(870, 640, 'bombTowerButton', function(){
                                             buyTower("bomb");}, this, 0, 1, 2);
        
        for (var i=0; i < Object.keys(buttons).length; i++) // For all zombie and tower buttons
        {
            buttons[ names[i] ].onInputOut.add(hoverOutButton, this);
            buttons[ names[i] ].inputEnabled = true;
        }
        // Hoverover function needs different arguments and putting that in a loop does not work
        // -> it passes a reference, so by the time the function is called, the arg is different.
        buttons['standard'].events.onInputOver.add(function(){hoverOverButton('standardZombie');});
        buttons['strong'].events.onInputOver.add(function(){hoverOverButton('strongZombie');});
        buttons['healing'].events.onInputOver.add(function(){hoverOverButton('healingZombie');});
        buttons['generations'].events.onInputOver.add(function(){hoverOverButton('generationsZombie');});
        buttons['minigun'].events.onInputOver.add(function(){hoverOverButton('minigunTower');});
        buttons['shotgun'].events.onInputOver.add(function(){hoverOverButton('shotgunTower');});
        buttons['gum'].events.onInputOver.add(function(){hoverOverButton('gumTower');});
        buttons['bomb'].events.onInputOver.add(function(){hoverOverButton('bombTower');});

        // Zombie bankrupt images -
        bankruptImages['standard'] = game.add.sprite(40, 160, 'zombieBankrupt');
        bankruptImages['strong'] = game.add.sprite(40, 320, 'zombieBankrupt');
        bankruptImages['healing'] = game.add.sprite(40, 480, 'zombieBankrupt');
        bankruptImages['generations'] = game.add.sprite(40, 640, 'zombieBankrupt');
        
        // Tower bankrupt images -
        bankruptImages['minigun'] = game.add.sprite(870, 160, 'minigunBankrupt');
        bankruptImages['shotgun'] = game.add.sprite(870, 320, 'shotgunBankrupt');
        bankruptImages['gum'] = game.add.sprite(870, 480, 'gumBankrupt');
        bankruptImages['bomb'] = game.add.sprite(870, 640, 'bombBankrupt');
        
        for (var i=0; i < Object.keys(bankruptImages).length; i++)
        {
            bankruptImages[ names[i] ].inputEnabled = true;
            bankruptImages[ names[i] ].events.onInputOut.add(hoverOutButton, this);
            bankruptImages[ names[i] ].kill(); // use kill() and reset() to hide/show
        }
        bankruptImages['standard'].events.onInputOver.add(function(){
                                                          hoverOverButton('standardZombie');});
        bankruptImages['strong'].events.onInputOver.add(function(){
                                                        hoverOverButton('strongZombie');});
        bankruptImages['healing'].events.onInputOver.add(function(){
                                                         hoverOverButton('healingZombie');});
        bankruptImages['generations'].events.onInputOver.add(function(){
                                                             hoverOverButton('generationsZombie');});
        bankruptImages['minigun'].events.onInputOver.add(function(){
                                                         hoverOverButton('minigunTower');});
        bankruptImages['shotgun'].events.onInputOver.add(function(){
                                                         hoverOverButton('shotgunTower');});
        bankruptImages['gum'].events.onInputOver.add(function(){
                                                     hoverOverButton('gumTower');});
        bankruptImages['bomb'].events.onInputOver.add(function(){
                                                      hoverOverButton('bombTower');});
        
		if(player.state == 'attacker'){
			//zombie path button (the red arrow on top of map)
			var zombiePathButton = game.add.button(472,160, 'zombiePathButton', changePath, this, 0, 1, 2);
			
			currentPathFrame = 0;
		}
		
		if(player.state == 'defender') {
			// zombie tombstone image where zombies spawn
			var zombieSpawn = game.add.image(470, spawn_y, 'zombieSpawn');
			zombieSpawn.scale.setTo(0.1); 
		}
        //load images for bottom upgrade box
        bottomUpgradeBox = game.add.sprite(144, 890, 'bottomUpgradeBox');
		baseHealthBar = game.add.sprite(150, 900, 'baseHealth');
			baseHealthBar.animations.add('100 health', [0], true);
			baseHealthBar.animations.add('90 health', [1], true);
			baseHealthBar.animations.add('80 health', [2], true);
			baseHealthBar.animations.add('70 health', [3], true);
			baseHealthBar.animations.add('60 health', [4], true);
			baseHealthBar.animations.add('50 health', [5], true);
			baseHealthBar.animations.add('40 health', [6], true);
			baseHealthBar.animations.add('30 health up', [7], true);
			baseHealthBar.animations.add('30 health down', [8], true);
			baseHealthBar.animations.add('20 health up', [9], true);
			baseHealthBar.animations.add('20 health down', [10], true);
			baseHealthBar.animations.add('10 health up', [11], true);
			baseHealthBar.animations.add('10 health down', [12], true);
			baseHealthBar.animations.add('0 health', [13], true);
            baseHealthBar.animations.play('100 Health');
		// text within the health bar to show the player the current base health
		baseHealthText = game.add.text(153,937,"Health: 2000", baseHealthStyle);


		//animations for the base (shows the base taking damage)
		base = game.add.sprite(432,780,'base'); // 6 frames total 100%,80%,60%,40%,20%,0%
			base.animations.add('100 health',[0],true);
			base.animations.add('80 health',[1],true);
			base.animations.add('60 health',[2],true);
			base.animations.add('40 health',[3],true);
			base.animations.add('20 health',[4],true);
			base.animations.add('10 health',[5],true);
			base.play('100 health');
        
        matchTimerTitle =  game.add.text(153, 982, "Timer:", infoTitleStyle);
        matchTimer =  game.add.text(230, 975, "0:00", infoTextStyle);
        moneyTitle =  game.add.text(153, 1015, "Money:", infoTitleStyle);
        if(player.state == 'attacker')
        {
            moneyText =  game.add.text(230, 1010, "$2000", moneyTextStyle);
            playerText = game.add.text(153,1055,("Attacker: " + player.username),infoTitleStyle);
        }
        else
        {
            moneyText =  game.add.text(230, 1010, "$1000", moneyTextStyle);
            playerText = game.add.text(153,1055,("Defender: " + player.username),infoTitleStyle);
        }
        
        //playerText = game.add.text(153,1055,("Username: " + player.username),infoTitleStyle);
        
        
		//  The tower bullet groups
		minigunBullets = game.add.group();
		minigunBullets.enableBody = true;
		minigunBullets.physicsBodyType = Phaser.Physics.ARCADE;
		minigunBullets.createMultiple(40, 'minigunBullet'); // creating 40 bullet sprites
		
		minigunBullets.setAll('anchor.x', 0.5); // center of the object - not topleft
		minigunBullets.setAll('anchor.y', 0.5); // center of the object - not topleft
		minigunBullets.setAll('scale.x', 0.5);  // reducing the size to half of its original image size
		minigunBullets.setAll('scale.y', 0.5);  // reducing the size to half of its original image size
		
        shotgunBullets = game.add.group();
        shotgunBullets.enableBody = true;
        shotgunBullets.physicsBodyType = Phaser.Physics.ARCADE;
        shotgunBullets.createMultiple(30, 'shotgunBullet'); // creating 30 bullet sprites
        
        shotgunBullets.setAll('anchor.x', 0.5); // center of the object - not topleft
        shotgunBullets.setAll('anchor.y', 0.5); // center of the object - not topleft
        shotgunBullets.setAll('scale.x', 0.5);  // reducing the size to half of its original image size
        shotgunBullets.setAll('scale.y', 0.5);  // reducing the size to half of its original image size

        gumBullets = game.add.group();
        gumBullets.enableBody = true;
        gumBullets.physicsBodyType = Phaser.Physics.ARCADE;
        gumBullets.createMultiple(30, 'gumBullet'); // creating 30 bullet sprites
        
        gumBullets.setAll('anchor.x', 0.5); // center of the object - not topleft
        gumBullets.setAll('anchor.y', 0.5); // center of the object - not topleft

        bombBullets = game.add.group();
        bombBullets.enableBody = true;
        bombBullets.physicsBodyType = Phaser.Physics.ARCADE;
        bombBullets.createMultiple(30, 'bombBullet'); // creating 30 bullet sprites
        
        bombBullets.setAll('anchor.x', 0.5); // center of the object - not topleft
        bombBullets.setAll('anchor.y', 0.5); // center of the object - not topleft
        bombBullets.setAll('scale.x', 0.5);  // reducing the size to half of its original image size
        bombBullets.setAll('scale.y', 0.5);  // reducing the size to half of its original image size

        explosions = game.add.group();
        for (var i = 0; i < 10; i++)
        {
            var explosionAnimation = explosions.create(0, 0, 'explosion', [0], false);
            explosionAnimation.anchor.setTo(0.5, 0.5);
            explosionAnimation.animations.add('explosion',[0,1,2,3,4],true);
        }
		
		/*Price labels for the zombie/tower buttons*/
		// Same style for each text
		var style = {font: "20px Arial", fill: "#29a329", align: "center" };
		//zombie price tags
		var standardZombieText = game.add.text(50, 240, "$100", style);
		var strongZombieText = game.add.text(50, 400, "$200", style);
		var healingZombieText = game.add.text(50, 560, "$300", style);
		var generationsZombieText = game.add.text(50, 720, "$400", style);
		//tower price tags
		var minigunTowerText = game.add.text(885, 240, "$100", style);
		var shotgunTowerText = game.add.text(885, 400, "$200", style);
        var gumTowerText = game.add.text(885, 560, "$300",style);
        var bombTowerText = game.add.text(885, 720, "$400",style);
        
        if (player.state == 'attacker')
        {
			matchmakingCurtain = game.add.sprite(0,129,'matchmakingCurtain');

            console.log("plz gray out");
            
            for (var i=0; i < zombieNames.length; i++)
            {
                buttons[ zombieNames[i] ].kill();
                
                bankruptImages[ zombieNames[i] ].reset(40, 160*(i+1));
                bankruptImages[ towerNames[i]  ].reset(870, 160*(i+1));
            }
        }
		if (player.state == 'defender') 
        {
            for (var i=0; i < towerNames.length; i++)
            {
                buttons[ towerNames[i] ].kill();
            }
        }
		if (player.state == 'defender')
        {
            followMouse['minigun'] = game.add.sprite(0,0,'minigunTower');
            followMouse['shotgun'] = game.add.sprite(0,0,'shotgunTower');
            followMouse['gum']     = game.add.sprite(0,0,'gumTower');
            followMouse['bomb']    = game.add.sprite(0,0,'bombTower');
            
            for (var i=0; i < Object.keys(followMouse).length; i++)
            {
                followMouse[ towerNames[i] ].anchor.set(0.5);
                followMouse[ towerNames[i] ].scale.setTo(0.5);
                
                game.physics.arcade.enable(followMouse[ towerNames[i] ]);
                followMouse[ towerNames[i] ].kill();
            }
            
		}

        // Hit ESC button to cancel tower selection from a tower button
        game.input.keyboard.addKey(Phaser.Keyboard.ESC).onDown.add(function () {
            cancelTowerClick(true);}, this);
        
        // Display instruction button (and one for cancelling it)
        instructionSheet = game.add.sprite(0,0,'instructionSheet');
        instructionSheet.kill();

//        instructionButtonGroup = game.add.group();
        var instructionButton = game.add.button(865,800, 'instructionsButton', function(){
            instructionButton.kill();
            instructionSheet.reset(0,0);
            closeInstructionButton.reset(865,800);
            usernameText.kill();
        }, this, 0,1,2);
    
        var closeInstructionButton = game.add.button(865,800, 'closeInstructionsButton', function(){ instructionSheet.kill();
            closeInstructionButton.kill();
            instructionButton.reset(865,800);
        }, this, 0, 1, 2);
        closeInstructionButton.kill();
        instructionButton.scale.setTo(0.5);
        closeInstructionButton.scale.setTo(0.5);
        
//        instructionButtonGroup.add(instructionButton);
//        instructionButtonGroup.add(closeInstructionButton);
        
	},
	
	
	update: function()
	{
        rescale();
        
        if (matchOver)
            game.state.start('matchResults');

        if (startRound && onlyOnce == 0)
            onlyOnce = 1;
        
        if (onlyOnce == 1) {
            // do something that only needs to be done once as game starts
            console.log("done once");

            onlyOnce = 2;    
        }
        if(defenderPlaceTowers && player.state == 'attacker') {
            matchmakingCurtain.destroy();
        }

        //check the base health and update the health text and health bar
        if(startRound){
            baseHealthText.setText("Health: " + baseHealth);
            //console.log("health: " + baseHealth);
            //console.log("/:" +baseHealth/2000);
            percentageBaseHealth = baseHealth / 2000;
            if( percentageBaseHealth >= .92)
            {
                //console.log("play 100");
                baseHealthBar.play('100 health');
                base.play('100 health');
            }
            else if( percentageBaseHealth < .92 && percentageBaseHealth > .89 ) // display 90 health bar
            {
                //console.log("play 90");
                baseHealthBar.play('90 health');
            }
            else if(percentageBaseHealth < .82 && percentageBaseHealth > .79 ) // display 80 health bar
            {
                //console.log("play 80");
                baseHealthBar.play('80 health');
                base.play('80 health');
            }
            else if(percentageBaseHealth < .72 && percentageBaseHealth > .69 ) // display 70 health bar
            {
                //console.log("play 70");
                baseHealthBar.play('70 health');
            }
            else if(percentageBaseHealth < .62 && percentageBaseHealth > .59 ) // display 60 health bar
            {
                //console.log("play 60");
                baseHealthBar.play('60 health');
                base.play('60 health');
            }
            else if(percentageBaseHealth < .52 && percentageBaseHealth > .49 ) // display 50 health bar
            {
                //console.log("play 50");
                baseHealthBar.play('50 health');
            }
            else if(percentageBaseHealth < .42 && percentageBaseHealth > .39 ) // display 40 health bar
            {
                //console.log("play 40");
                baseHealthBar.play('40 health');
                base.play('40 health');
            }
            else if(percentageBaseHealth < .32 && percentageBaseHealth > .29 ) // display 30 health bar
            {	
                if(baseHealthUp < 20 && baseHealthDown == 0) // simply controls which flashing health bar image to display
                {
                    //console.log("play 30");
                    baseHealthBar.play('30 health up');
                    ++baseHealthUp;
                    if(baseHealthUp == 20) baseHealthDown = 20;
                }
                else
                {
                    baseHealthBar.play('30 health down');
                    --baseHealthDown;
                    if(baseHealthDown == 0) baseHealthUp = 0;
                }
            }
            else if(percentageBaseHealth < .22 && percentageBaseHealth > .19 ) // display 20 health bar
            {	
                if(baseHealthUp < 20 && baseHealthDown == 0) // simply controls which flashing health bar image to display
                {
                    //console.log("play 20");
                    baseHealthBar.play('20 health up');
                    base.play('20 health');
                    ++baseHealthUp;
                    if(baseHealthUp == 20) baseHealthDown = 20;
                }
                else
                {
                    baseHealthBar.play('20 health down');
                    base.play('20 health');
                    --baseHealthDown;
                    if(baseHealthDown == 0) baseHealthUp = 0;
                }
            }
            else if(percentageBaseHealth < .12 && percentageBaseHealth > .09 ) // display 10 health bar
            {	
                if(baseHealthUp < 20 && baseHealthDown == 0) // simply controls which flashing health bar image to display
                {
                    //console.log("play 10");
                    baseHealthBar.play('10 health up');
                    base.play('10 health');
                    ++baseHealthUp;
                    if(baseHealthUp == 20) baseHealthDown = 20;
                }
                else
                {
                    baseHealthBar.play('10 health down');
                    base.play('10 health');
                    --baseHealthDown;
                    if(baseHealthDown == 0) baseHealthUp = 0;
                }
            }
            else if (baseHealth <= 0)
            {
                baseHealthBar.play('0 health');
            }
            
            
            
            //gradually add money to both players
            moneyTimer++;
			//console.log(moneyTimer);
			if(moneyTimer >= regenTime)
			{
				if(player.state == 'attacker'){
					if(player.money < 2000){
                        player.money += 50;
                        //document.getElementById("attacker-money").innerHTML = "Money: $" + player.money;
                        moneyText.setText( "$" + player.money);
                    }
				}
				else if(player.state == 'defender'){ // defender
					moneyText.setText( "$" + player.money);
                   // document.getElementById("defender-money").innerHTML = "Money: $" + player.money;
                }
					moneyTimer = 0;
			}
			for(var i = 0; i<zombieArray.length; i++){
				if(zombieArray[i].countdown != 0){
					if(zombieArray[i].countdown == 1){
						zombieArray[i].countdown--;
						console.log('BEFORE'+zombieArray[i].speed);
						zombieArray[i].speed *= (-zombieArray[i].amount);
						console.log('AFTER'+zombieArray[i].speed);
						zombieStatArray[i].speed = zombieArray[i].speed;
						zombieArray[i].amount = 0;
					}	
					else
						zombieArray[i].countdown--;
					console.log(zombieArray[i].countdown);
				}
				
			}
        }
        
		if (player.state == 'defender') {
            
            // Allow tower image to follow the mouse cursor when a tower button is clicked
            for (var i=0; i < Object.keys(followMouse).length; i++)
            {
                // No tower selected. Skip the rest
                if (gTowerType == "") break;
                
                // if one of the tower is selected: minigun, shotgun, gum, bomb
                if (gTowerType == towerNames[i])
                {
                    // rather far, bring it close fast
                    if (game.physics.arcade.distanceToPointer(
                            followMouse[ towerNames[i] ],game.input.activePointer) > 1)
                    {
                        game.physics.arcade.moveToPointer(
                            followMouse[ towerNames[i] ], 300, game.input.activePointer, 10);
                    }
                    // rather close, bring it close slowly
                    if (game.physics.arcade.distanceToPointer(
                            followMouse[ towerNames[i] ],game.input.activePointer) > 0.1)
                    {
                        game.physics.arcade.moveToPointer(
                            followMouse[ towerNames[i] ], 300, game.input.activePointer, 50);
                    }
                }
            }
		}
		
		
		// check if the attacker has enough money for zombie buttons
		if(player.state == 'attacker')
		{
            for (var i=0; i < towerNames.length; i++)
                bankruptImages[ towerNames[i] ].reset(870, 160*(i+1));
            
			if (!startRound) 
            {
                for (var i=0; i < zombieNames.length; i++)
                    bankruptImages[ zombieNames[i] ].reset(40, 160*(i+1));
            }
            else // startRound
            {
			     var currentMoney = player.money;
                // standard zombie button
                
                
                for (var i=0; i < zombieNames.length; i++)
                {
                    if (currentMoney < price[ zombieNames[i] ])
                    {
                        buttons[ zombieNames[i] ].kill();
                        bankruptImages[ zombieNames[i] ].reset(40,160*(i+1));
                    }
                    else // kill the greyed out image and display the button again
                    {
                        buttons[ zombieNames[i] ].reset(40,160*(i+1));

                        if(bankruptImages[ zombieNames[i] ].alive)
                            bankruptImages[ zombieNames[i] ].kill();
                    }
                }

            }

		}
		
		// defender check if user has enough money for tower purchases if not display bankrupt image
		if(player.state == 'defender')
		{
            for (var i=0; i < zombieNames.length; i++)
                bankruptImages[ zombieNames[i] ].reset(40, 160*(i+1));
			
			var currentMoney = player.money;
            
            for (var i=0; i < towerNames.length; i++)
            {
                if (currentMoney < price[ towerNames[i] ])
                {
                    buttons[ towerNames[i] ].kill();
                    bankruptImages[ towerNames[i] ].reset(870,160*(i+1));
                }
                else // kill the greyed out image and display the button again
                {
                    buttons[ towerNames[i] ].reset(870,160*(i+1));
                    
                    if(bankruptImages[ towerNames[i] ].alive)
                        bankruptImages[ towerNames[i] ].kill();
                }
            }

            
		}
		
	   // Change settings for every zombie elements
		if(state == 'attacker' && zombieStatArray.length > 0){
			if(zombieStatArray.length == (zombieArray.length-1)){
				zombieStatArray.push(new zombieStat(lane, spawn_x, spawn_y, 100, 1))
			}
			var message = JSON.stringify(zombieStatArray);

			socket.send(message);
		}
		
		// Applying tower attacks
		var withinRangeArray = []; // empty array now
        var bombArray = [];
		towerSize = 55; // width and height of towers. towersize / 2 = offset.
		offset = towerSize/2;
		
		// Going through every tower (one by one)
		for (var i=0; i< towerArray.length; i++) {
			withinRangeArray = [];
            bombArray = [];

			// For every zombie and every tower, "overlap" of bullet+zombie will cause the damage
			for (var j=0; j< zombieArray.length; j++) {
				game.physics.arcade.overlap(minigunBullets, zombieArray[j].image,
					function(zombie,bullet){ //console.log("pre overlap");
						bullet.kill();
						zombieArray[j].hurt(towerArray[i].damage, j);
				}, null, this);
                game.physics.arcade.overlap(shotgunBullets, zombieArray[j].image,
                    function(zombie,bullet){ //console.log("pre overlap");
                        bullet.kill();
                        zombieArray[j].hurt(towerArray[i].damage, j);
                }, null, this);
                game.physics.arcade.overlap(gumBullets, zombieArray[j].image,
                    function(zombie,bullet){ //console.log("pre overlap");
                        bullet.kill();
                        zombieArray[j].hurt(towerArray[i].damage, j);
                }, null, this);
			}
			
			// If it's not ready for the tower to shoot, then skip the whole process for it
            // BOMB TOWER's OVERLAP doesn't work if this is one (it's defined down unlike the rest on above)
			//if (game.time.now+30 < towerArray[i].nextFire) continue;

			var towerCenterX = parseInt(towerArray[i].pos_x) + parseInt(offset);
			var towerCenterY = parseInt(towerArray[i].pos_y) + parseInt(offset);
			
			// 1. Picking the zombies within range
			// I CAn USE DISTANCEBETWEEN FUNCTION TO GET CIRCULAR ATTACK RANGE
			for (var j=0; j< zombieArray.length; j++) {
				//game.debug.text("for loop ya",200,200);
				var leftRange   = towerCenterX - towerSize *2;
				var rightRange  = towerCenterX + towerSize *2;
				var topRange    = towerCenterY - towerSize *2;
				var bottomRange = towerCenterY + towerSize *2;

			var zombieCenterX = zombieArray[j].image.x + 55;
			var zombieCenterY = zombieArray[j].image.y + 55;

				if (leftRange < zombieCenterX && zombieCenterX < rightRange &&
					topRange  < zombieCenterY && zombieCenterY < bottomRange) {
					
					withinRangeArray.push(j);
				}
			}
			
			if (withinRangeArray.length == 0) continue;

			// 2. Choosing the specific one to attack
            console.log("wR: "+withinRangeArray.length);
            bombArray.splice(0,0,withinRangeArray[0]);
			var frontIndex = withinRangeArray[0];
            var newFrontIndex = true;
			for (var j=0; j< withinRangeArray.length; j++) {

				// placed ahead in terms of y-coordinate
				// Instead of having a zombie > frontZombie (then it crashes when they are on top of each other)
				if (zombieArray[withinRangeArray[j]].y - zombieArray[frontIndex].y > 1) {
					frontIndex = withinRangeArray[j];
                    bombArray.splice(0,0,withinRangeArray[j]);//at 0, delete none, inser the index
				}
				
				// last x-value changing lane - as heading towards the base
				else if (zombieArray[withinRangeArray[j]].y == zombieArray[frontIndex].y && zombieArray[frontIndex].y >= 700) { // 700 IS NOT FIXED!!!
				 
					// closer to the base in x value
					if (Math.abs(zombieArray[withinRangeArray[j]].y-485) < Math.abs(zombieArray[frontIndex].y-485)) { // 485 NOT FIXED!!
						frontIndex = withinRangeArray[j];
                        bombArray.splice(0,0,withinRangeArray[j]);//at 0, delete none, inser the index
					}
				}
				
				// first x-value changing lane - as walking away from the zombie tombstone
				else if (zombieArray[withinRangeArray[j]].y == zombieArray[frontIndex].y && zombieArray[frontIndex].y <= 160) { // 160 IS NOT FIXED!!!

					// further from the zombie factory in x value
					if (Math.abs(zombieArray[frontIndex].y-485) < Math.abs(zombieArray[j].y-485)) { // 485 NOT FIXED!!
						frontIndex = withinRangeArray[j];
                        bombArray.splice(0,0,withinRangeArray[j]);//at 0, delete none, inser the index
					}
				}
                if(!newFrontIndex) bombArray.push(withinRangeArray[j]);
                newFrontIndex = false;
			}

			// 3. attack!
            for (var j=0; j< zombieArray.length; j++) {
                if (zombieArray[j].image == undefined) { console.log("f undef"); continue; }
                game.physics.arcade.overlap(bombBullets, zombieArray[j].image,
                    function(zombie,bullet){ console.log("oouch2");
                        bullet.kill();
                                            
                        var explosionAnimation = explosions.getFirstExists(false);
                        explosionAnimation.reset(zombieArray[j].pos_x, zombieArray[j].pos_y);

                        zombieArray[j].hurts(towerArray[i].damage, bombArray);
                }, null, this);
            }
            
            if (towerArray[i].type == "bomb")
            {
                var target = -1;
                
                if (bombArray.length >= 5) // bullets towards the third, damage first~fifth
                    target = bombArray[2];
                else if (bombArray.length >= 3) // bullets towards the second, damage first~3rd/4th
                    target = bombArray[1];
                else if (bombArray.length > 0)
                    target = bombArray[0];
                
                if (zombieArray.length == 0) continue;
                
                console.log("target: "+target+"_"+bombArray.length+"_"+zombieArray.length);
                while (zombieArray[target] == undefined) {
                    target++;
                    if (target == bombArray.length) continue;
                }
                if (target == -1) continue;
                
                towerArray[i].attack(zombieArray[target]);
            }
            else
                towerArray[i].attack(zombieArray[frontIndex]);
			
		} // end of for-loop for towerArray
	}
	
};

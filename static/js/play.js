/* play.js */




/*
	- at end of match (i.e. endRound('attacker') ) we have to call the 'matchResults' game state
			-> game.state.start('matchResults');


*/



var playMatchState = 
{
	create: function()
	{
		
		console.log('STATE:Play');
        
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
		var base = game.add.sprite(432,780,'base');
		
		/*Creating each button*/
		// Zombie Buttons
		var standardZombieButton = game.make.button(40, 160, 'standardZombieButton', function(){sendAddZombie("standard");}, this, 0, 1, 2);
		var strongZombieButton  =  game.make.button(40, 320, 'strongZombieButton', function(){sendAddZombie("strong");}, this, 0, 1, 2);
		var healingZombieButton  =  game.make.button(40, 480, 'healingZombieButton', function(){sendAddZombie("healing");}, this, 0, 1, 2);
		var generationsZombieButton  =  game.make.button(40, 640, 'generationsZombieButton', function(){sendAddZombie("generations");}, this, 0, 1, 2);
		// Tower Buttons
		var minigunTowerButton  =  game.make.button(870, 160, 'minigunTowerButton', function(){buyTower("minigun");}, this, 0, 1, 2);
		var shotgunTowerButton  =  game.make.button(870, 320, 'shotgunTowerButton', function(){buyTower("shotgun");}, this, 0, 1, 2);
		var gumTowerButton  =  game.make.button(870, 480, 'gumTowerButton', function(){buyTower("gum");}, this, 0, 1, 2);
		var bombTowerButton  =  game.make.button(870, 640, 'bombTowerButton', function(){buyTower("bomb");}, this, 0, 1, 2);
        
		/*Attaching buttons to the screen*/
		buttonGroup = game.add.group();
		//zombie buttons
		buttonGroup.add(standardZombieButton);
		buttonGroup.add(strongZombieButton);
		buttonGroup.add(healingZombieButton);
		buttonGroup.add(generationsZombieButton);
		//tower buttons
		buttonGroup.add(minigunTowerButton);
		buttonGroup.add(shotgunTowerButton);
		buttonGroup.add(gumTowerButton);
		buttonGroup.add(bombTowerButton);
		
		// Zombie bankrupt images - 
			//I have to add the sprite and then kill it so the webpage knows of its existence, and its easier to use the reset() function
		var standardZombieBankrupt = game.add.sprite(40, 160, 'zombieBankrupt');
			standardZombieBankrupt.kill(); // temporarily kill the image
			bankruptImages['standard'] = standardZombieBankrupt;
		var strongZombieBankrupt = game.add.sprite(40, 320, 'zombieBankrupt');
			strongZombieBankrupt.kill(); // temporarily kill the image
			bankruptImages['strong'] = strongZombieBankrupt;
		var healingZombieBankrupt = game.add.sprite(40, 480, 'zombieBankrupt');
			healingZombieBankrupt.kill(); // temporarily kill the image
			bankruptImages['healing'] = healingZombieBankrupt;
		var generationsZombieBankrupt = game.add.sprite(40, 640, 'zombieBankrupt');
			generationsZombieBankrupt.kill(); // temporarily kill the image
			bankruptImages['generations'] = generationsZombieBankrupt;
		
		// Tower bankrupt images -
			////I have to add the sprite and then kill it so the webpage knows of its existence, and its easier to use the reset() function
		var minigunTowerBankrupt = game.add.sprite(870, 160, 'minigunBankrupt');
			minigunTowerBankrupt.kill();
			bankruptImages['minigun'] = minigunTowerBankrupt;
		var shotgunTowerBankrupt = game.add.sprite(870, 320, 'shotgunBankrupt');
			shotgunTowerBankrupt.kill();
			bankruptImages['shotgun'] = shotgunTowerBankrupt;
		var gumTowerBankrupt = game.add.sprite(870, 480, 'gumBankrupt');
			gumTowerBankrupt.kill();
			bankruptImages['gum'] = gumTowerBankrupt;
		var bombTowerBankrupt = game.add.sprite(870, 640, 'bombBankrupt');
			bombTowerBankrupt.kill();
			bankruptImages['bomb'] = bombTowerBankrupt;

		if(player.state == 'attacker'){
			//zombie path button (the red arrow on top of map)
			var zombiePathButton = game.make.button(472,160, 'zombiePathButton', changePath, this, 0, 1, 2);
			buttonGroup.add(zombiePathButton);
			
			currentPathFrame = 0;
		}
		
		if(player.state == 'defender') {
			// zombie tombstone image where zombies spawn
			var zombieSpawn = game.add.image(470, spawn_y, 'zombieSpawn');
			zombieSpawn.scale.setTo(0.1); 
		}
        
		//  The tower bullet groups
		towerBullets = game.add.group(); // TEMP
		towerBullets.enableBody = true;
		towerBullets.physicsBodyType = Phaser.Physics.ARCADE;
		towerBullets.createMultiple(40, 'bullet'); // creating 40 bullet sprites
		
		towerBullets.setAll('anchor.x', 0.5); // center of the object - not topleft
		towerBullets.setAll('anchor.y', 0.5); // center of the object - not topleft
		towerBullets.setAll('scale.x', 0.5);  // reducing the size to half of its original image size
		towerBullets.setAll('scale.y', 0.5);  // reducing the size to half of its original image size
		
		/*WILL CHANGE ONCE BRANDON'S MAKES ALL BULLET IMAGES
		minigunBullets = game.add.group();
		minigunBullets.enableBody = true;
		minigunBullets.physicsBodyType = Phaser.Physics.ARCADE;
		minigunBullets.createMultiple(30, '_____'); // creating 30 bullet sprites

		minigunBullets.setAll('anchor.x', 0.5); // center of the object - not topleft
		minigunBullets.setAll('anchor.y', 0.5); // center of the object - not topleft

		shotgunBullets = game.add.group();
		shotgunBullets.enableBody = true;
		shotgunBullets.physicsBodyType = Phaser.Physics.ARCADE;
		shotgunBullets.createMultiple(30, '_____'); // creating 30 bullet sprites

		shotgunBullets.setAll('anchor.x', 0.5); // center of the object - not topleft
		shotgunBullets.setAll('anchor.y', 0.5); // center of the object - not topleft

		bombBullets    = game.add.group();
		bombBullets.enableBody = true;
		bombBullets.physicsBodyType = Phaser.Physics.ARCADE;
		bombBullets.createMultiple(30, '_____'); // creating 30 bullet sprites

		bombBullets.setAll('anchor.x', 0.5); // center of the object - not topleft
		bombBullets.setAll('anchor.y', 0.5); // center of the object - not topleft
		*/
		
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

		if (player.state == 'attacker')
			matchmakingCurtain = game.add.sprite(0,129,'matchmakingCurtain');
		
		if (player.state == 'defender') {
			minigunTowerToBePlaced = game.add.sprite(game.world.centerX, game.world.centerY, 'minigunTower');
			shotgunTowerToBePlaced = game.add.sprite(game.world.centerX, game.world.centerY, 'shotgunTower');
			gumTowerToBePlaced = game.add.sprite(game.world.centerX, game.world.centerY, 'gumTower');
			bombTowerToBePlaced = game.add.sprite(game.world.centerX, game.world.centerY, 'bombTower');

			minigunTowerToBePlaced.anchor.set(0.5);
			shotgunTowerToBePlaced.anchor.set(0.5);
			gumTowerToBePlaced.anchor.set(0.5);
			bombTowerToBePlaced.anchor.set(0.5);

			// Half of the size
			minigunTowerToBePlaced.scale.setTo(0.5);
			shotgunTowerToBePlaced.scale.setTo(0.5);
			gumTowerToBePlaced.scale.setTo(0.5);
			bombTowerToBePlaced.scale.setTo(0.5);
			
			//  And enable the Sprite to have a physics body:
			game.physics.arcade.enable(minigunTowerToBePlaced);
			game.physics.arcade.enable(shotgunTowerToBePlaced);
			game.physics.arcade.enable(gumTowerToBePlaced);
			game.physics.arcade.enable(bombTowerToBePlaced);
			
			minigunTowerToBePlaced.kill();
			shotgunTowerToBePlaced.kill();
			gumTowerToBePlaced.kill();
			bombTowerToBePlaced.kill();
		}
	},
	
	
	update: function()
	{
		// Allow tower image to follow the mouse cursor when a tower button is clicked
		if (player.state == 'defender') {
			if (gTowerType == 'minigun') {
				if (game.physics.arcade.distanceToPointer(minigunTowerToBePlaced, game.input.activePointer) > 1) {
					game.physics.arcade.moveToPointer(minigunTowerToBePlaced, 300, game.input.activePointer, 10);
				}
				if (game.physics.arcade.distanceToPointer(minigunTowerToBePlaced, game.input.activePointer) > 0.1) {
					game.physics.arcade.moveToPointer(minigunTowerToBePlaced, 300, game.input.activePointer, 50);
				}
			}
			else if (gTowerType == 'shotgun') {
				if (game.physics.arcade.distanceToPointer(shotgunTowerToBePlaced, game.input.activePointer) > 1) {
					game.physics.arcade.moveToPointer(shotgunTowerToBePlaced, 300, game.input.activePointer, 10);
				}
				if (game.physics.arcade.distanceToPointer(shotgunTowerToBePlaced, game.input.activePointer) > 0.1) {
					game.physics.arcade.moveToPointer(shotgunTowerToBePlaced, 300, game.input.activePointer, 50);
				}
			}
			else if (gTowerType == 'gum') {
				if (game.physics.arcade.distanceToPointer(gumTowerToBePlaced, game.input.activePointer) > 1) {
					game.physics.arcade.moveToPointer(gumTowerToBePlaced, 300, game.input.activePointer, 10);
				}
				if (game.physics.arcade.distanceToPointer(gumTowerToBePlaced, game.input.activePointer) > 0.1) {
					game.physics.arcade.moveToPointer(gumTowerToBePlaced, 300, game.input.activePointer, 50);
				}
			}
			else if (gTowerType == 'bomb') {
				if (game.physics.arcade.distanceToPointer(bombTowerToBePlaced, game.input.activePointer) > 1) {
					game.physics.arcade.moveToPointer(bombTowerToBePlaced, 300, game.input.activePointer, 10);
				}
				if (game.physics.arcade.distanceToPointer(bombTowerToBePlaced, game.input.activePointer) > 0.1) {
					game.physics.arcade.moveToPointer(bombTowerToBePlaced, 300, game.input.activePointer, 50);
				}
			}
		}
		
		//gradually add money to both players
		if(startRound){
			moneyTimer++;
			
			if(moneyTimer >= regenTime)
			{
				if(player.state == 'attacker'){
					player.money += 50;
					document.getElementById("attacker-money").innerHTML = "Money: $" + player.money;
				}
				else // defender
					document.getElementById("defender-money").innerHTML = "Money: $" + player.money;
					moneyTimer = 0;
			}
		}
		
		// check if the attacker has enough money for zombie buttons
		if(player.state == 'attacker')
		{
			bankruptImages.minigun.reset(870,160);
			bankruptImages.shotgun.reset(870, 320);
			bankruptImages.gum.reset(870, 480);
			bankruptImages.bomb.reset(870,640);
			
			var currentMoney = player.money;
			// standard zombie button
			if(currentMoney < price['standard']) // kill button and display greyed out button
			{
				buttonGroup.getAt(0).kill(); // standard zombie button
				bankruptImages.standard.reset(40,160);
			}
			else // kill the greyed out image and display the button again
			{
				buttonGroup.getAt(0).reset(40, 160);
				if(bankruptImages.standard.alive)
					bankruptImages.standard.kill();
			}
			// strong zombie button
			if(currentMoney < price['strong']) // kill button and display greyed out button
			{
				buttonGroup.getAt(1).kill(); // strong zombie button
				bankruptImages.strong.reset(40,320);
			}
			else // kill the greyed out image and display the button again
			{
				buttonGroup.getAt(1).reset(40, 320);
				if(bankruptImages.strong.alive)
					bankruptImages.strong.kill();
			}
			// healing zombie button
			if(currentMoney < price['healing']) // kill button and display greyed out button
			{
				buttonGroup.getAt(2).kill(); // healing zombie button
				bankruptImages.healing.reset(40,480);
			}
			else // kill the greyed out image and display the button again
			{
				buttonGroup.getAt(2).reset(40, 480);
				if(bankruptImages.healing.alive)
					bankruptImages.healing.kill();
			}
			// generations zombie button
			if(currentMoney < price['generations']) // kill button and display greyed out button
			{
				buttonGroup.getAt(3).kill(); // generations zombie button
				bankruptImages.generations.reset(40,640);
			}
			else // kill the greyed out image and display the button again
			{
				buttonGroup.getAt(3).reset(40, 640);
				if(bankruptImages.generations.alive)
					bankruptImages.standard.kill();
			}
		}
		
		// defender check if user has enough money for tower purchases if not display bankrupt image
		if(player.state == 'defender')
		{
			bankruptImages.standard.reset(40, 160);
			bankruptImages.strong.reset(40, 320);
			bankruptImages.healing.reset(40, 480);
			bankruptImages.generations.reset(40, 640);
			
			var currentMoney = player.money;
			if(currentMoney < price['minigun'])
			{
				buttonGroup.getAt(4).kill(); // minigun tower button
				bankruptImages.minigun.reset(870, 160);
			}
			else
			{
				buttonGroup.getAt(4).reset(870, 160);
				if(bankruptImages.minigun.alive)
					bankruptImages.minigun.kill();
			}
			if(currentMoney < price['shotgun'])
			{
				buttonGroup.getAt(5).kill(); // shotgun tower button
				bankruptImages.shotgun.reset(870, 320);
			}
			else
			{
				buttonGroup.getAt(5).reset(870, 320);
				if(bankruptImages.shotgun.alive)
					bankruptImages.shotgun.kill();
			}
			if(currentMoney < price['gum'])
			{
				buttonGroup.getAt(6).kill(); // gum tower button
				bankruptImages.gum.reset(870, 480);
			}
			else
			{
				buttonGroup.getAt(6).reset(870, 480);
				if(bankruptImages.gum.alive)
					bankruptImages.gum.kill();
			}
			if(currentMoney < price['bomb'])
			{
				buttonGroup.getAt(7).kill(); // bomb tower button
				bankruptImages.bomb.reset(870, 640);
			}
			else
			{
				buttonGroup.getAt(7).reset(870, 640);
				if(bankruptImages.bomb.alive)
					bankruptImages.bomb.kill();
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
		towerSize = 55; // width and height of towers. towersize / 2 = offset.
		offset = towerSize/2;
		
		// Going through every tower (one by one)
		for (var i=0; i< towerArray.length; i++) {
			withinRangeArray = [];

			// For every zombie and every tower, "overlap" of bullet+zombie will cause the damage
			for (var j=0; j< zombieArray.length; j++) {
				game.physics.arcade.overlap(towerBullets, zombieArray[j].image,
					function(zombie,bullet){ console.log("pre overlap");
						bullet.kill();
						zombieArray[j].hurt(towerArray[i].damage, j);
				}, null, this);
			}
			
			// If it's not ready for the tower to shoot, then skip the whole process for it
			if (game.time.now+30 < towerArray[i].nextFire) continue;

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
			var frontIndex = withinRangeArray[0];
			for (var j=0; j< withinRangeArray.length; j++) {

				// placed ahead in terms of y-coordinate
				// Instead of having a zombie > frontZombie (then it crashes when they are on top of each other)
				if (zombieArray[withinRangeArray[j]].y - zombieArray[frontIndex].y > 1) {
					frontIndex = withinRangeArray[j];
				}
				
				// last x-value changing lane - as heading towards the base
				else if (zombieArray[withinRangeArray[j]].y == zombieArray[frontIndex].y && zombieArray[frontIndex].y >= 700) { // 700 IS NOT FIXED!!!
				 
					// closer to the base in x value
					if (Math.abs(zombieArray[withinRangeArray[j]].y-485) < Math.abs(zombieArray[frontIndex].y-485)) { // 485 NOT FIXED!!
						frontIndex = withinRangeArray[j];
					}
				}
				
				// first x-value changing lane - as walking away from the zombie tombstone
				else if (zombieArray[withinRangeArray[j]].y == zombieArray[frontIndex].y && zombieArray[frontIndex].y <= 160) { // 160 IS NOT FIXED!!!

					// further from the zombie factory in x value
					if (Math.abs(zombieArray[frontIndex].y-485) < Math.abs(zombieArray[j].y-485)) { // 485 NOT FIXED!!
						frontIndex = withinRangeArray[j];
					}
				}
			}

			// 3. attack!
			towerArray[i].attack(zombieArray[frontIndex]);
			
		} // end of for-loop for towerArray
	}
	
};
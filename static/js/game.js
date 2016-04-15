/*
		game.js

		- loads the phaser canvas
		- loads all game states
		- connect to server
		- place all global code here 
			- classes
			- global variables
		- starts  boot.js
*/


// DevLog https://docs.google.com/document/d/19USEq0-lkOCuyqLz8M2PJI1ccd0YC4jkxCCgurSIgUM/edit


/*      Phaser canvas     */
// 733 = map height, 129 = title height
var game = new Phaser.Game(1000, 1000+129, Phaser.AUTO, 'IntenseDefense'/*, { preload: preload, create: create, update: update }*/);


/*     Game states     */
game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('login', loginState);
game.state.add('matchmaking', matchmakingState);
game.state.add('playMatch', playMatchState);
game.state.add('matchResults', matchResultsState);
game.state.add('endRound', endRoundState);
game.state.add('endGame', endGameState);

game.state.start('boot');


/*    Global Variables     */



var map;
var player;

var buttonGroup; // array of 4 zombie buttons and 4 tower buttons, and zombit path button
var zombieStatArray = []; // array of zombies (for server side)
var zombieArray = [];     // array of zombies (for client side)
var towerArray = [];      // array of towers

var towerBullets; // temp
var minigunBullets;
var shotgunBullets;
var bombBullets;

// Tower image following the mouse cursor once a tower button is clicked
var minigunTowerToBePlaced;
var shotgunTowerToBePlaced;
var gumTowerToBePlaced;
var bombTowerToBePlaced;

// variables for the info box below the map
var bottomUpgradeBox;
var baseHealthBar;
var baseHealthUp = 0; // acts as counter so the image doen't flash too fast goes up to 3
var baseHealthDown = 0;
var base;
// text for base health
var baseHealthText;
var baseHealthStyle = {font: "20px Arial", fill: "#ffffff", align: "left" };

var bottomBoxStyle = {font: "15px Arial", fill: "#F5F5F5", align: "center"};
var BottomInfoTower;
var BottomInfoTowerText;
var towerClicked = false;
var fireRateText;
var damageText;

var matchTimerTitle;
var matchTimer; //the timer countdown i.e. "5:00" == 5 minutes
var newTime; // variable used to overwrite the timer text
var moneyTitle;
var moneyText; // the actual amount of money the user has i.e. "$2000"
var playerText; // display players name on the info box

var infoTitleStyle = {font: "20px Arial", fill: "#000000", align: "left" };
var infoTextStyle = {font: "30px Arial", fill: "#000000", align: "left" };
var moneyTextStyle = {font: "30px Arial", fill: "#004d00", align: "left" };

//Prices for zombies/towers
var price = {
    standard:100,   strong:200,     healing:300,    generations:400,
	minigun:100,    shotgun:200,    gum:300,        bomb:400};

// Used to generate money for both players over time
var moneyTimer = 0;
var regenTime = 100;

// Some other constants
var bulletTravelTime = 450;
var baseHealth = 2000;
var spawn_x = 482, spawn_y = 160;

//curtain for the attacker, so attacker wont see where defender is placing towers for 30 seconds
var attackerCurtain;
var matchmakingCurtain;
var startRound = false; // controls the timer and money generator functions
var matchNum = 0;

var state; // either attacker or defender

// Attacker's choice to send zombies down lane default is center
var lane = 'center';

// Defender's choice
var gTowerType = ""; // flag && global variable for tower placement - g for global

// zombie/Tower bankrupt images
var bankruptImages = {};


/*       Classes         */

// Player Class
Player = function(username, state, money) {
    this.username = username;
    this.state = state;
	this.money = money;
}
// Zombie Class
Zombie = function(type, lane, inX, inY) {
    this.type = type;
    this.lane = lane;
    this.pos_x = inX; // real positions topleft
	this.pos_y = inY; // real positions topleft
    this.alive = true;
   	this.time = game.time.now;
	
    if(type == 'standard')
	{
		this.damage = 100;
		this.health = 200;
		this.speed = 1;
	}
	else if(type == 'strong')
	{
		this.damage = 200;
		this.health = 300;
		this.speed = 0.6;
	}
	else if(type == 'healing')
	{
		this.damage = 50;
		this.health = 500;
		this.speed = 1;
	}
	else
	{
		this.damage = 300;
		this.health = 600;
		this.speed = 0.4
	}
	
	// positions calculated for bullet targeting
	if (lane == "center") {
		this.x = inX+57/2;  
		this.y = inY+75/2 + 30*(bulletTravelTime/1000)*this.speed;;
    }
	else if (lane == "left") {
		this.x = inX+57/2 - 50*(bulletTravelTime/1000)*this.speed;;
		this.y = inY+75/2;
    }
	else if (lane == "right") {
		this.x = inX+57/2 + 50*(bulletTravelTime/1000)*this.speed;;
		this.y = inY+75/2;
    }
	
	// individual zombie size: 57x75
    this.image = game.add.sprite(this.pos_x, this.pos_y, type+'Zombie');
	this.image.animations.add('moveRight',[0,1,2,3],true);
	this.image.animations.add('moveLeft',[4,5,6,7],true);
	this.image.animations.add('moveDown',[8,9,10,11],true);
	this.image.scale.setTo(0.5); // half of its original image size
	
    game.physics.enable(this.image, Phaser.Physics.ARCADE);
};
Zombie.prototype.move = function(newPos_x, newPos_y, newDirection) {
    
	// real zombie position
	this.pos_x = newPos_x;
    this.pos_y = newPos_y;

	// zombie image position
	this.image.x = newPos_x;
    this.image.y = newPos_y;
	
	this.direction = newDirection;

	// Change animation accordingly
	if(this.direction == 'down') {
		this.image.animations.play('moveDown',this.speed*10);
	}
	else if (this.direction == "right") {
		this.image.animations.play('moveRight',this.speed*10);
	}
	else if (this.direction == "left") {
		this.image.animations.play('moveLeft',this.speed*10);
	}

	var x_offset = 57/2, y_offset = 75/2; // zombie size ÷ 2
	
	// this.pos_x|y is the zombies' topleft position. 
	// this.x|y is adjusted with the x|y_offset, so we have their center positions
	this.x = this.pos_x + x_offset;
	this.y = this.pos_y + y_offset;
	
	// (x,y) coordinates for bullet-zombie overlap 
	// - where zombie would be by the time the bullet is supposed to hit the zombie
	if (this.direction == "down") {
		this.y = this.y + 30*(bulletTravelTime/1000)*this.speed;
	}
	else if (this.direction == "left") {
		this.x = this.x - 50*(bulletTravelTime/1000)*this.speed;
	}
	else if (this.direction == "right") {
		this.x = this.x + 50*(bulletTravelTime/1000)*this.speed;
	}
};
Zombie.prototype.hurt = function(damage, index) { // I SHOULD NOT NEED THE 2ND ARG
    this.health -= damage;
	console.log("bam");
    
    if (this.health <= 0) { // killing the zombie
        
        this.alive = false;
        this.image.kill();

		// create two more standard zombies
		if(zombieArray[index].type == 'generations'){
			for(var i = 0; i<2; i++) { 
				zombieStatArray.push(new zombieStat(zombieArray[index].lane, zombieArray[index].pos_x, zombieArray[index].pos_y-i*20, 100, 1));
				zombieArray.push(new Zombie('standard', zombieArray[index].lane, zombieArray[index].pos_x, zombieArray[index].pos_y-i*20));
			}
		}
				
		// Generate more money for defender
		if(zombieArray[index].type == 'generations')
			socket.send('defenderMoney 60');
		else if(zombieArray[index].type == 'standard')
			socket.send('defenderMoney 20');
		else if(zombieArray[index].type == 'strong')
			socket.send('defenderMoney 40');
		else // healer zombie
			socket.send('defenderMoney 40');
		
		// deleting the zombie object from the arrays
		zombieArray.splice(index, 1);
		zombieStatArray.splice(index,1);
		
        return true;
    }
    return false;
};

// Tower Class
var Tower = function(type, x, y, spriteName, bullets) {
    this.type = type;
    // this.range = range; // make int if we use distanceBetween - from center
    this.pos_x = x-20; //tower's topleft position (displayed tower image size: 55x55)
    this.pos_y = y-25; //tower's topleft position (displayed tower image size: 55x55)
    this.game = game;
	this.bullets = towerBullets;
    this.nextFire = 0;
    
	if(type == 'minigun'){
		this.fireRate = 750;
		this.damage = 30;
        this.level = 1;
	}
	else if(type == 'shotgun'){
		this.fireRate = 950;
		this.damage = 80;
        this.level = 1;
	}
	else if(type == 'gum')
	{
		this.fireRate = 1000;
		this.damage = 0;
        this.level = 1;
	}
	else { // bomb
		this.fireRate = 3000;
		this.damage = 150;
        this.level = 1;
	}
    this.image = game.add.sprite(this.pos_x, this.pos_y, type+'Tower');
    this.image.scale.setTo(0.5); // half of its original image size (110x110)->(55,55)
    this.image.inputEnabled = true;
    
    // this is so the attacker will not see the tower placements 
    if(player.state == 'attacker' && !startRound){
        this.image.sendToBack();
    }
    
    this.image.events.onInputUp.add(function(){this.upgradeT();}, this);
    
    game.physics.enable(this.image, Phaser.Physics.ARCADE);
};

Tower.prototype.upgradeT = function(){
    
     if(towerClicked == true){
            
            towerClicked = false;
            ResetBottomBox();
        }
    BottomInfoTowerText = game.add.text(570, 920, this.type + ' Tower', bottomBoxStyle);
    BottomInfoTower = game.add.sprite(510, 920, this.type + 'Tower');
    BottomInfoTower.scale.setTo(0.5);
    fireRateText = game.add.text(570, 970, 'Fire Rate:' + this.fireRate, bottomBoxStyle);
    damageText = game.add.text(570, 1025, 'Damage:' + this.damage, bottomBoxStyle);
    var towerUpgrade = game.add.button(700, 970, 'upgradeLvl1', function() {this.upgradeFireRate();}, this, 0,1,2);
    var towerDamageUpgrade = game.add.button(700, 1025, 'upgradeLvl1', function() {this.upgradeDamage();}, this, 0,1,2);
    towerClicked = true;
};


Tower.prototype.upgradeFireRate = function(){
    this.fireRate += 1000;
    fireRateText.kill();
    fireRateText = game.add.text(570, 970, "Fire Rate:" + this.fireRate, bottomBoxStyle);
};

Tower.prototype.upgradeDamage = function(){
    this.damage += 100;
    damageText.kill();
    damageText = game.add.text(570, 1025, "Damage:" + this.damage, bottomBoxStyle);
};

function ResetBottomBox(){
    BottomInfoTowerText.kill();
    BottomInfoTower.kill();
    fireRateText.kill();
    damageText.kill();
};


Tower.prototype.attack = function(underAttack) {
    console.log("att");
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
		
        this.nextFire = this.game.time.now + this.fireRate;
        
        var bullet = this.bullets.getFirstDead();
        
        var offset =36; // should be 36
        bullet.reset(parseInt(this.pos_x)+parseInt(offset), parseInt(this.pos_y)+parseInt(offset));
        
        bullet.rotation = this.game.physics.arcade.moveToObject(bullet, underAttack, 2, bulletTravelTime);
		
        // applying damage to zombie
        //underAttack.hurt(34, bullet, frontIndex);
    }
};





/*      Global functions    */

function zombieStat(_lane, _pos_x, _pos_y, _speed) {
	this.lane   = _lane;
	this.pos_x  = _pos_x;
	this.pos_y  = _pos_y;
	this.speed  = _speed;
	this.direction = "";
}

function newRound() {
	for(var i = 0; i<zombieArray.length; i++)
		zombieArray[i].image.kill();
	for(var j = 0; j<towerArray.length; j++)
		towerArray[j].image.kill();
	
	zombieArray = [];
	zombieStatArray = [];
	towerArray = [];
	
	/* if (player.state == 'attacker')
		{
			player.state = 'defender';
			// send socket message for player name
		}
		else
		{
			player.state = 'attacker';
			// send socket message for player name
		}
		
		// restart timers
	*/
}



/*
function countdown(minutes) { // function for the timer for each round

	// adjusted this function to allow a 30 second timer as well
    var seconds = 60;
    var mins = minutes;
    var counter;
	
    if(mins < 1){
        seconds = mins*100;
        mins = 0;
        console.log(mins+":"+seconds);
        counter = document.getElementById("gameStartTimer");
    }
    else{
        counter = document.getElementById("timer");
    }
    function tick() {
        
        //var counter = document.getElementById("timer");
        //counter = document.getElementById("gameStartTimer");
        var current_minutes;
        if(mins<1){
            current_minutes = 0;
        }
        else{
            current_minutes = mins-1
        }
        seconds--;
        counter.innerHTML = current_minutes.toString() + ":" + (seconds < 10 ? "0" : "") + String(seconds);
        matchTimer.setText = current_minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
        if(mins<1){
           if(seconds == 0 && current_minutes == 0){
                socket.send("startRound");
                console.log("start Round");
                // tower placement done start game allow both players to start playing now
           }   
        }
        else{
            if(seconds == 0 && current_minutes == 0){
                endRound('defender');         
                //end of match: defender wins
            }
		}
        if( seconds > 0 ) {
            setTimeout(tick, 1000);
        } else {
 
            if(mins > 1){
 
               // countdown(mins-1);   never reach “00″ issue solved:Contributed by Victor Streithorst
               setTimeout(function () { countdown(mins - 1); }, 1000);
 
            }
        }
    }
    tick();
}


*/
function changePath(){
    /*
        frame #     Zombie path
            0           center
            3           right
            6           left
    */

	// buttonGroup.getAt(8) == arrow button for attacker
    if(currentPathFrame == 0) {
        buttonGroup.getAt(8).setFrames(3,4,5);
		lane = 'right';
    }
    else if(currentPathFrame == 3) {
        buttonGroup.getAt(8).setFrames(6,7,8);
		lane = 'left';
    }
    else if(currentPathFrame == 6){
        buttonGroup.getAt(8).setFrames(0,1,2);
		lane = 'center';
    }
    currentPathFrame = buttonGroup.getAt(8).frame;
}
function damageBase(index) {
	baseHealth -= zombieArray[index].damage;
    document.getElementById("health").innerHTML = " Health: " + baseHealth; 
	
	// Killing the zombie and removing it from the arrays
	zombieArray[index].alive = false;    
	zombieArray[index].image.kill();
	zombieArray.splice(index, 1);
	zombieStatArray.splice(index,1);
	
	if(baseHealth <= 0)
		endRound('attacker');
	
	// inside the countdown(), endRound('defender') will be called accordingly
	
	return true;
}
function endRound(winner) {
	if(winner == "attacker")
		window.alert("Attacker Wins!");
	else
		window.alert("Defender Wins!");
	
    startRound = false;
	newRound();
}

function sendAddZombie(zombieType){ 
    // check if the player has enough money for the zombie
    var canBuy = false;
	
    if(player.state == 'attacker'){
		
        if(zombieType == "standard"){
            if( player.money < price['standard'] ){
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money + " - Not enough money";
            }
            else{
                canBuy = true;
                player.money -= 100;
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money;
            }
        }
        else if(zombieType == "strong"){
            if( player.money < price['strong'] ){
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money + " - Not enough money";
            }
            else{
                canBuy = true;
                player.money -= 200;
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money;
            }
        }
        else if(zombieType == "healing"){
            if( player.money < price['healing'] ){
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money + " - Not enough money";
            }
            else{
                canBuy = true;
                player.money -= 300;
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money;
            }
        }
        else if(zombieType == "generations"){
            if( player.money < price['generations'] ){
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money + " - Not enough money";
            }
            else{
                canBuy = true;
                player.money -= 400;
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money;
            }
        }
		
		if(canBuy){
			socket.send("addZombie"+zombieType); // this will call buyZombie()
		}
    }
}
function buyZombie(type) {
	/* Attacker's money amount is checked and deducted accordingly 
	   by the caller of this function, "sendAddZombie" */
	
    if (type == "standard"){
		zombieStatArray.push(new zombieStat(lane, spawn_x, spawn_y, 1));
		zombieArray.push(new Zombie(type, lane, spawn_x, spawn_y));
	}
    else if (type == "strong"){
		zombieStatArray.push(new zombieStat(lane, spawn_x, spawn_y, 0.6));
		zombieArray.push(new Zombie(type, lane, spawn_x, spawn_y));
	}
	else if (type == "healing"){
		zombieStatArray.push(new zombieStat(lane, spawn_x, spawn_y, 1));
		zombieArray.push(new Zombie(type, lane, spawn_x, spawn_y));
	}
    else if (type == "generations"){
		zombieStatArray.push(new zombieStat(lane, spawn_x, spawn_y, 0.3));
		zombieArray.push(new Zombie(type, lane, spawn_x, spawn_y));
	}
}
function buyTower(type) {
    /* this turns on the flag only.
     in mouseClick(item){}, it will place a tower if a tower is clicked then click on a map */
    
    if      (gTowerType == 'minigun')   minigunTowerToBePlaced.kill();
    else if (gTowerType == 'shotgun')   shotgunTowerToBePlaced.kill();
    else if (gTowerType == 'gum')       gumTowerToBePlaced.kill();
    else if (gTowerType == 'bomb')      bombTowerToBePlaced.kill();

    gTowerType = type;
    if(player.state == 'defender')
		map.play('towerPlacement');
    
    if      (gTowerType == 'minigun')   minigunTowerToBePlaced.reset(870,160);
    else if (gTowerType == 'shotgun')   shotgunTowerToBePlaced.reset(870,320);
    else if (gTowerType == 'gum')       gumTowerToBePlaced.reset(870,480);
    else if (gTowerType == 'bomb')      bombTowerToBePlaced.reset(870,640);
    
}
function mouseClick(item) {
	var notOnLane = false;
	var canBuy = false;

	if(player.state == 'defender'){
		
		// game.input.mousePointer.x|y: mouse cursor position.
		var mouse_x = game.input.mousePointer.x;
		var mouse_y = game.input.mousePointer.y;
		
		// Check if the defender is trying to place the tower on zombie lanes
		if(mouse_x >= 185 && mouse_x <= 800 && mouse_y <= 215) {
			document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths"; 
		}
		else if(mouse_x >= 185 && mouse_x <= 278 && mouse_y >= 162 && mouse_y <= 752) {
			document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths";
		}
		else if(mouse_x >= 708 && mouse_x <= 800 && mouse_y >= 162 && mouse_y <= 752) {
			document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths";
		}
		else if(mouse_x >= 201 && mouse_x <= 771 && mouse_y >= 666 && mouse_y <= 750) {
			document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths";
		}
		else if(mouse_x >= 447 && mouse_x <= 540 && mouse_y >= 210 && mouse_y <= 820) {
			document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths";
		}
		else if(mouse_x >= 147 && mouse_x <= 817 && mouse_y >= 820 && mouse_y <= 858) {
			document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths"; 
		}
		else if(mouse_x >= 410 && mouse_x <= 560 && mouse_y >= 750) {
			document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths"; 
		}
		else {
			notOnLane = true;
		}
		
		// Check if the player has enough money for the zombie
		if (gTowerType == "minigun") {
			if(player.money < price['minigun']){
				document.getElementById("defender-money").innerHTML = "Money: $" + player.money + " - Not enough money";
			}
			else{
				canBuy = true;
				player.money -= price['minigun'];
				document.getElementById("defender-money").innerHTML = "Money: $" + player.money;
			}
		}
		else if (gTowerType == "shotgun") {
			if(player.money < price['shotgun']){
				document.getElementById("defender-money").innerHTML = "Money: $" + player.money + " - Not enough money";
			}
			else{
				canBuy = true;
				player.money -= price['shotgun'];
				document.getElementById("defender-money").innerHTML = "Money: $" + player.money;
			}
		}
		else if (gTowerType == "gum") {
			if(player.money < price['gum']){
				document.getElementById("defender-money").innerHTML = "Money: $" + player.money + " - Not enough money";
			}
			else{
				canBuy = true;
				player.money -= price['gum'];
				document.getElementById("defender-money").innerHTML = "Money: $" + player.money;
			}
		}
		else if (gTowerType == "bomb") {
			if(player.money < price['bomb']){
				document.getElementById("defender-money").innerHTML = "Money: $" + player.money + " - Not enough money";
			}
			else{
				canBuy = true;
				player.money -= price['bomb'];
				document.getElementById("defender-money").innerHTML = "Money: $" + player.money;
			}
		}
		
		if(notOnLane && canBuy) {
			map.play('plainMap');
			document.getElementById("Tower-Placement-Error").innerHTML = "";
			socket.send('addTower,'+gTowerType+','+mouse_x+','+mouse_y);
            
            if      (gTowerType == 'minigun')   minigunTowerToBePlaced.kill();
            else if (gTowerType == 'shotgun')   shotgunTowerToBePlaced.kill();
            else if (gTowerType == 'gum')       gumTowerToBePlaced.kill();
            else if (gTowerType == 'bomb')      bombTowerToBePlaced.kill();
            
			gTowerType = "";
		}
	}
}















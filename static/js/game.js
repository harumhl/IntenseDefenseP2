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
var loginButtonGroup; // set of buttons used in login state
var loginButtonGroup; // set of buttons used in login state

var zombieStatArray = []; // array of zombies (for server side)
var zombieArray = [];     // array of zombies (for client side)
var towerArray = [];      // array of towers

var zombieFullNames = ['standardZombie', 'strongZombie', 'healingZombie', 'generationsZombie'];
var towerFullNames  = ['minigunTower',   'shotgunTower', 'gumTower',      'bombTower'];
var fullNames = ['standardZombie', 'strongZombie', 'healingZombie', 'generationsZombie',
                 'minigunTower',   'shotgunTower', 'gumTower',      'bombTower'];


var zombieNames = ['standard', 'strong',  'healing', 'generations'];
var towerNames  = ['minigun',  'shotgun', 'gum',     'bomb'];
var names = ['standard', 'strong',  'healing', 'generations',
             'minigun',  'shotgun', 'gum',     'bomb'];

var bulletss = []; // two "s" to emphasize that it's an array of bullets group
var explosions;

var zombiePathButton;
// Tower image following the mouse cursor once a tower button is clicked
var followMouse = [];

var buttons = [];

// controls bug when user is placing tower, this will not allow the user to also click
// on a placed tower to pull up the upgrade options
var placingTower = false;

// variables for the info box below the map
var bottomUpgradeBox;
var baseHealthBar;
var baseHealthUp = 0; // acts as counter so the image doen't flash too fast goes up to 3
var baseHealthDown = 0;
var base;
// text for base health
var baseHealthText;
var baseHealthStyle = {font: "20px Arial", fill: "#ffffff", align: "left" };

var bottomBoxStyle = {font: "20px Arial", fill: "#F5F5F5", align: "center"};
var bottomBoxTowerNameStyle = {font: "30px Arial", fill: "#F5F5F5", align: "center"};
var BottomInfoTower;
var BottomInfoTowerText;
var towerClicked = false;
var fireRateText;
var damageText;
var upgradeFireRateButton;
var upgradeDamageButton;

var matchTimerTitle;
var matchTimer; //the timer countdown i.e. "5:00" == 5 minutes
var newTime = ""; // variable used to overwrite the timer text
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
var priceText = [];

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

// variables used for the login game state
var usernamePossible = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890._"; // possible values for username
var username = "";
var keyboardInput = false;
var usernameText;
var textStyle = {font: "65px Arial", fill: "#595959", align: "center", boundsAlignH: "left", boundsAlignV: "middle"};
var usernameClicked = false;

var instructionSheet;

var towerUpgrade;
var towerDamageUpgrade;

var matchOver = false;
var roleChangedToNumber = 0;
var roleSwitched = false;
var winner = '';
var defenderPlaceTowers = false;

// matchResults variables needed
var zombieCount = {standard:0,   strong:0,     healing:0,    generations:0};
var towerCount = {minigun:0,    shotgun:0,    gum:0,        bomb:0};
var endTime; // what was the timer at when match ended
var endHealth; // what frame was the health bar at when match ended
var roundMatchNum = {round:1, match:0};
var playerNames = {attacker:"", defender:""};

var checkone;//images for the green checkmarks
var checktwo; 
/* next 3 lines trying to fix the timer*/
var seconds  = 60;
var current_minutes;
var attackerWon = false;

var continueClicks = 0;


/*       Classes         */

// Player Class
Player = function(username, state, money) {
    this.username = username;
    this.state = state;
	this.money = money;
	this.wins = 0;
}
// Zombie Class
Zombie = function(type, lane, inX, inY) {
    this.type = type;
    this.lane = lane;
    this.pos_x = inX; // real positions topleft
	this.pos_y = inY; // real positions topleft
    this.alive = true;
   	this.time = game.time.now;
	this.amount = 0;
	this.countdown = 0;
	this.healingCooldown = 0;
	
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
Zombie.prototype.slow = function(amount, index){
	if(amount < this.amount){
		if(this.amount < 0){
				this.speed = this.speed*this.amount;
		}	
		this.speed = this.speed/(-amount);
		this.amount = amount;
	}
	zombieStatArray[index].speed = this.speed;
	this.countdown = 20;
	console.log(this.countdown);
	
}
Zombie.prototype.hurt = function(damage, index) { // I SHOULD NOT NEED THE 2ND ARG
    if(damage > 0)
		this.health -= damage;
	else
		this.slow(damage, index);
	//console.log("bam");
    
    if (this.health <= 0) { // killing the zombie
        
        this.alive = false;
        this.image.kill();

		// create two more standard zombies
		if(zombieArray[index].type == 'generations'){
			for(var i = 0; i<2; i++) { 
				if(zombieArray[index].direction == 'left'){
					zombieStatArray.push(new zombieStat(zombieArray[index].lane, zombieArray[index].pos_x+i*20, zombieArray[index].pos_y, 1));
					zombieArray.push(new Zombie('standard', zombieArray[index].lane, zombieArray[index].pos_x+i*20, zombieArray[index].pos_y));
				}
				else if(zombieArray[index].direction == 'right'){
					zombieStatArray.push(new zombieStat(zombieArray[index].lane, zombieArray[index].pos_x-i*20, zombieArray[index].pos_y, 1));
					zombieArray.push(new Zombie('standard', zombieArray[index].lane, zombieArray[index].pos_x-i*20, zombieArray[index].pos_y));
				}
				else{
					zombieStatArray.push(new zombieStat(zombieArray[index].lane, zombieArray[index].pos_x, zombieArray[index].pos_y-i*20, 1));
					zombieArray.push(new Zombie('standard', zombieArray[index].lane, zombieArray[index].pos_x, zombieArray[index].pos_y-i*20));
				}
			}
		}
				
		// Generate more money for defender
		if(zombieArray[index].type == 'generations'){
            if(player.state == 'defender'){
                if(player.money < 2000)
                    player.money += 60;
            }
			//socket.send('defenderMoney 60');
        }
		else if(zombieArray[index].type == 'standard'){
			if(player.state == 'defender'){
                if(player.money < 2000)
                    player.money += 20;
            }
            //socket.send('defenderMoney 20');
        }
		else if(zombieArray[index].type == 'strong'){
			if(player.state == 'defender'){
                if(player.money < 2000)
                    player.money += 40;
            }
            //socket.send('defenderMoney 40');
        }
		else{ // healer zombie
            if(player.state == 'defender'){
                if(player.money < 2000)
                    player.money += 40;
            }
			//socket.send('defenderMoney 40');
        }
		
		// deleting the zombie object from the arrays
		zombieArray.splice(index, 1);
		zombieStatArray.splice(index,1);
		
        return true;
    }
    return false;
};
Zombie.prototype.hurts = function (damage, indexArray) {
    for (var i=0; i < indexArray.length; i++) {
        if (zombieArray[indexArray[i]] == undefined) continue; // probably already dead
        zombieArray[indexArray[i]].hurt(damage, indexArray[i]);
        if (i >= 4) break; // attack up to five, maximum for bomb tower, 0<= i <=4
    }
};

// Tower Class
var Tower = function(type, x, y, spriteName, bullets) {
    this.type = type;
    // this.range = range; // make int if we use distanceBetween - from center
    this.pos_x = x-20; //tower's topleft position (displayed tower image size: 55x55)
    this.pos_y = y-25; //tower's topleft position (displayed tower image size: 55x55)
    this.game = game;
    this.nextFire = 0;
    
	if(type == 'minigun'){
        this.bullets = bulletss['minigun'];
		this.fireRate = 750;
		this.damage = 30;
        this.fireRateLevel = 1;
        this.damageLevel = 1;
	}
	else if(type == 'shotgun'){
        this.bullets = bulletss['shotgun'];
		this.fireRate = 950;
		this.damage = 80;
        this.fireRateLevel = 1;
        this.damageLevel = 1;

	}
	else if(type == 'gum') {
        this.bullets = bulletss['gum'];
		this.fireRate = 1000;
		this.damage = -2;
        this.fireRateLevel = 1;
        this.damageLevel = 1;

	}
	else { // bomb
        this.bullets = bulletss['bomb'];
		this.fireRate = 1000;
		this.damage = 150;
        this.fireRateLevel = 1;
        this.damageLevel = 1;
	}
    
    this.image = game.add.sprite(this.pos_x, this.pos_y, type+'Tower');
    this.image.scale.setTo(0.5); // half of its original image size (110x110)->(55,55)
    this.image.inputEnabled = true;
    
    // this is so the attacker will not see the tower placements in pre-mastch
    if(player.state == 'attacker' && !startRound){
        this.image.sendToBack();
    }
    
    this.image.events.onInputUp.add(function(){this.upgradeT();}, this);
    
    game.physics.enable(this.image, Phaser.Physics.ARCADE);
};

Tower.prototype.upgradeT = function(){
    if(placingTower == true) {
        console.log("placingTower: " + placingTower.toString());
        return; // if player is currently trying to place a tower dont give them the option to try to upgrade
    }
    if(player.state == 'defender'){
        if(towerClicked == true){
                towerClicked = false;
                ResetBottomBox();
        }

        if(this.type == 'minigun')     BottomInfoTowerText = game.add.text(610, 920, "Minigun Tower", bottomBoxTowerNameStyle);
        else if(this.type == 'shotgun')         BottomInfoTowerText = game.add.text(610, 920,'Shotgun Tower', bottomBoxTowerNameStyle);
        else if(this.type == 'gum')         BottomInfoTowerText = game.add.text(610, 920, 'Gum Tower', bottomBoxTowerNameStyle);
        else  BottomInfoTowerText = game.add.text(610, 920,'Bomb Tower', bottomBoxTowerNameStyle);

        BottomInfoTower = game.add.sprite(510, 920, this.type + 'Tower');
        BottomInfoTower.scale.setTo(0.5);
        fireRateText = game.add.text(550, 990, 'Fire Rate:  ' + this.fireRate, bottomBoxStyle);
        damageText = game.add.text(550, 1035, 'Damage:   ' + this.damage, bottomBoxStyle);
       // console.log("here asldkfjasldkfj" + this.fireRateLevel);

        switch(this.fireRateLevel){
            case 1:
                 upgradeFireRateButton = game.add.button(720, 990, 'upgradeLvl1', function() {this.sendUpgrade("fire rate"); }, this, 0,1,2);  
            break;
            case 2:
                upgradeFireRateButton = game.add.button(720, 990, 'upgradeLvl2', function() {this.sendUpgrade("fire rate"); }, this, 0,1,2);        
            break;
            case 3:
                upgradeFireRateButton = game.add.button(720, 990, 'upgradeLvl3', function() {this.sendUpgrade("fire rate"); }, this, 0,1,2);
            break;
            case 4:
                upgradeFireRateButton = game.add.button(720, 990, 'upgradeMax', function() {this.voidUpdate(); }, this, 0,1,2);
            break;
        }
        
        switch(this.damageLevel){
            case 1:
                upgradeDamageButton = game.add.button(720, 1035, 'upgradeLvl1', function() {this.sendUpgrade("damage rate"); }, this, 0,1,2);
            break;
            case 2:
                upgradeDamageButton = game.add.button(720, 1035, 'upgradeLvl2', function() {this.sendUpgrade("damage rate"); }, this, 0,1,2);
            break;
            case 3:
                upgradeDamageButton = game.add.button(720, 1035, 'upgradeLvl3', function() {this.sendUpgrade("damage rate"); }, this, 0,1,2);
            break;
            case 4:
                upgradeDamageButton = game.add.button(720, 1035, 'upgradeMax', function() {this.voidUpdate(); }, this, 0,1,2);
            break;
                //this.upgrade.....
    }
        towerClicked = true;
    }
};


Tower.prototype.upgradeFireRate = function(){
    this.fireRate -= 100;
    if(player.state == 'defender'){
        fireRateText.setText("Fire Rate:  " + this.fireRate);
        this.fireRateLevel += 1;
    }
    
        switch(this.fireRateLevel){
        case 2:
            upgradeFireRateButton = game.add.button(720, 990, 'upgradeLvl2', function() {this.sendUpgrade("fire rate"); }, this, 0,1,2);        
        break;
        case 3:
            upgradeFireRateButton = game.add.button(720, 990, 'upgradeLvl3', function() {this.sendUpgrade("fire rate"); }, this, 0,1,2);
        break;
        case 4:
            upgradeFireRateButton = game.add.button(720, 990, 'upgradeMax', function() {this.voidUpdate(); }, this, 0,1,2);
        break;
        }
};

Tower.prototype.upgradeDamage = function(){
    this.damage += 25;
    if(player.state == 'defender'){
        damageText.setText("Damage:   " + this.damage);
        this.damageLevel += 1;
    }
    switch(this.damageLevel){
        case 2:
            this.upgradeDamageButton = game.add.button(720, 1035, 'upgradeLvl2', function() {this.sendUpgrade("damage rate"); }, this, 0,1,2);
        break;
        case 3:
            this.upgradeDamageButton = game.add.button(720, 1035, 'upgradeLvl3', function() {this.sendUpgrade("damage rate"); }, this, 0,1,2);
        break;
        case 4:
            this.upgradeDamageButton = game.add.button(720, 1035, 'upgradeMax', function() {this.voidUpdate(); }, this, 0,1,2);
        break;
    }
};

Tower.prototype.sendUpgrade = function(upgradeType){
    //console.log("upgradeType: " + upgradeType);
    if(upgradeType == "fire rate"){
        this.upgradeFireRate();
    }
    
    if (upgradeType == "damage rate"){
        this.upgradeDamage();
    }
    
    var posX = this.pos_x;
    var posY = this.pos_y;
    var type = this.type;
    console.log("upgrade " + upgradeType + ":"+this.pos_x+":"+this.pos_y+":"+this.type+":");
    socket.send("upgrade " + upgradeType + ":"+this.pos_x+":"+this.pos_y+":"+this.type);

}

function ResetBottomBox(){
    BottomInfoTowerText.kill();
    BottomInfoTower.kill();
    fireRateText.kill();
    damageText.kill();
};

Tower.prototype.attack = function(underAttack) {
   // console.log("att");
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
Zombie.prototype.heal = function(){
	//var healingRangeImage = game.add.sprite(this.pos_x, this.pos_y, 'healingCircle');
	//healingRangeImage.visible = false;
	//console.log('image created');
	for (var j=0; j< zombieArray.length; j++) {
		if(game.physics.arcade.distanceBetween(this, zombieArray[j]) < 50){
				console.log(zombieArray[j].health);
				zombieArray[j].health += 5;
				console.log(zombieArray[j].health);
		}
	}
	this.healingCooldown = 20;
	//healingRangeImage.kill();
	//console.log('image destroyed');
}

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





var timeout;
function countdown(minutes) { // function for the timer for each round
    console.log("countdown");
	// adjusted this function to allow a 30 second timer as well
    seconds = 60;
    mins = minutes;
    var counter;
	
    if(mins < 1){
        seconds = mins*100;
        mins = 0;
        //console.log(mins+":"+seconds);
       // counter = document.getElementById("gameStartTimer");
    }
    else{
        //counter = document.getElementById("timer");
    }
    function tick() {
        
        //var counter = document.getElementById("timer");
        //counter = document.getElementById("gameStartTimer");
        current_minutes;
        if(mins<1){
            current_minutes = 0;
        }
        else{
            current_minutes = mins-1
        }
        seconds--;
        //counter.innerHTML = current_minutes.toString() + ":" + (seconds < 10 ? "0" : "") + String(seconds);
        //console.log(current_minutes.toString() + ":" + (seconds < 10 ? "0" : "") + String(seconds));
        //matchTimer.setText = current_minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
        // DEFENDER DOES NOT SEE THE 30 SECOND TIMER DONT KNOW WHY
        newTime = current_minutes.toString() + ":" + (seconds < 10 ? "0" : "") + String(seconds)
        //matchTimer.setText(current_minutes.toString() + ":" + (seconds < 10 ? "0" : "") + String(seconds));
        if(typeof matchTimer == "undefined")
            matchTimer =  game.add.text(230, 975, "0:00", infoTextStyle);
        matchTimer.setText(newTime);
        
		if(mins<1){
           if(seconds == 0 && current_minutes == 0){
                socket.send("startRound");
                console.log("start Round");
                // tower placement done start game allow both players to start playing now
           }   
        }
        else{
            if(seconds <= 0 && current_minutes == 0 && !attackerWon){
                winner = 'defender';
                endRound('defender');         
                //end of match: defender wins
            }
		}
        if( seconds > 0 ) {
            if(attackerWon){
					console.log("RIGHT FUCKING HERE");
					current_minutes = 0;
					seconds = 0;
					clearTimeout(timeout);
					return;
			}
			else
				timeout = setTimeout(tick, 1000);
        } else {
 
            if(mins > 1){
 
                if(attackerWon){
					console.log("RIGHT FUCKING HERE");
					current_minutes = 0;
					seconds = 0;
					clearTimeout(timeout);
					return;
				}
				else{
					if(attackerWon){
						current_minutes = 0;
						seconds = 0;
						
						//tick();
					}
					else
						timeout = setTimeout(function () { countdown(mins - 1); }, 1000);
						// countdown(mins-1);   never reach “00″ issue solved:Contributed by Victor Streithorst
				}
            }
        }
    }
    tick();
}



function changePath(){
    /*
        frame #     Zombie path
            0           center
            3           right
            6           left
    */

	// buttonGroup.getAt(8) == arrow button for attacker
    if(currentPathFrame == 0) {
        zombiePathButton.setFrames(3,4,5);
		lane = 'right';
    }
    else if(currentPathFrame == 3) {
        zombiePathButton.setFrames(6,7,8);
		lane = 'left';
    }
    else if(currentPathFrame == 6){
        zombiePathButton.setFrames(0,1,2);
		lane = 'center';
    }
    currentPathFrame = zombiePathButton.frame;
}
function damageBase(index) {
    if(zombieArray[index] == undefined) {
        console.log("UNDEFINED zombieArray[" + index + "], zombieArray.length: " + zombieArray.length);
        return;
    }
	
	baseHealth -= zombieArray[index].damage;
    //document.getElementById("health").innerHTML = " Health: " + baseHealth; 
	
	// Killing the zombie and removing it from the arrays
	zombieArray[index].alive = false;    
	zombieArray[index].image.kill();
	zombieArray.splice(index, 1);
	zombieStatArray.splice(index,1);
	
    if(baseHealth <= 0) {
        winner = 'attacker';
        attackerWon = true;
        seconds = 0;
        current_minutes = 0;
 		endRound('attacker');
    }
	
	// inside the countdown(), endRound('defender') will be called accordingly
	
	return true;
}
function endRound(winner) {
    if(winner == "attacker")//		window.alert("Attacker Wins!");
        console.log("Attacker Wins!");
    else                    //		window.alert("Defender Wins!");
        console.log("Defender Wins!");
    
    startRound = false;
    matchOver = true;
    newRound();
}

function sendAddZombie(zombieType){ 
    // check if the player has enough money for the zombie
    var canBuy = false;
	
    if(player.state == 'attacker'){
		
        if(zombieType == "standard"){
            if( player.money < price['standard'] ){
                //document.getElementById("attacker-money").innerHTML = "Money: $" + player.money + " - Not enough money";
            }
            else{
                canBuy = true;
                player.money -= 100;
                moneyText.setText( "$" + player.money);
                //document.getElementById("attacker-money").innerHTML = "Money: $" + player.money;
            }
        }
        else if(zombieType == "strong"){
            if( player.money < price['strong'] ){
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money + " - Not enough money";
            }
            else{
                canBuy = true;
                player.money -= 200;
                moneyText.setText( "$" + player.money);
                //document.getElementById("attacker-money").innerHTML = "Money: $" + player.money;
            }
        }
        else if(zombieType == "healing"){
            if( player.money < price['healing'] ){
                ///document.getElementById("attacker-money").innerHTML = "Money: $" + player.money + " - Not enough money";
            }
            else{
                canBuy = true;
                player.money -= 300;
                moneyText.setText( "$" + player.money);
                //.getElementById("attacker-money").innerHTML = "Money: $" + player.money;
            }
        }
        else if(zombieType == "generations"){
            if( player.money < price['generations'] ){
                //document.getElementById("attacker-money").innerHTML = "Money: $" + player.money + " - Not enough money";
            }
            else{
                canBuy = true;
                player.money -= 400;
                moneyText.setText( "$" + player.money);
                //document.getElementById("attacker-money").innerHTML = "Money: $" + player.money;
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
    
    cancelTowerClick(false, false);
    
    gTowerType = type;
    if(player.state == 'defender')
		map.play('towerPlacement');
    
    if      (gTowerType == 'minigun')   followMouse['minigun'].reset(870,160);
    else if (gTowerType == 'shotgun')   followMouse['shotgun'].reset(870,320);
    else if (gTowerType == 'gum')       followMouse['gum'].reset(870,480);
    else if (gTowerType == 'bomb')      followMouse['bomb'].reset(870,640);
    
    placingTower = true;
    
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
			//document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths"; 
		}
		else if(mouse_x >= 185 && mouse_x <= 278 && mouse_y >= 162 && mouse_y <= 752) {
			//document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths";
		}
		else if(mouse_x >= 708 && mouse_x <= 800 && mouse_y >= 162 && mouse_y <= 752) {
			//document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths";
		}
		else if(mouse_x >= 201 && mouse_x <= 771 && mouse_y >= 666 && mouse_y <= 750) {
			//document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths";
		}
		else if(mouse_x >= 447 && mouse_x <= 540 && mouse_y >= 210 && mouse_y <= 820) {
			//document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths";
		}
		else if(mouse_x >= 147 && mouse_x <= 817 && mouse_y >= 820 && mouse_y <= 858) {
			//document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths"; 
		}
		else if(mouse_x >= 410 && mouse_x <= 560 && mouse_y >= 750) {
			//document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths"; 
		}
		else {
			notOnLane = true;
		}
		
		// Check if the player has enough money for the zombie
		if (gTowerType == "minigun") {
			if(player.money < price['minigun']){
				//document.getElementById("defender-money").innerHTML = "Money: $" + player.money + " - Not enough money";
			}
			else{
				canBuy = true;
				player.money -= price['minigun'];
                
                
                moneyText.setText( "$" + player.money);
				//document.getElementById("defender-money").innerHTML = "Money: $" + player.money;
			}
		}
		else if (gTowerType == "shotgun") {
			if(player.money < price['shotgun']){
				//document.getElementById("defender-money").innerHTML = "Money: $" + player.money + " - Not enough money";
			}
			else{
				canBuy = true;
				player.money -= price['shotgun'];
                
                moneyText.setText( "$" + player.money);
				//document.getElementById("defender-money").innerHTML = "Money: $" + player.money;
			}
		}
		else if (gTowerType == "gum") {
			if(player.money < price['gum']){
				//document.getElementById("defender-money").innerHTML = "Money: $" + player.money + " - Not enough money";
			}
			else{
				canBuy = true;
				player.money -= price['gum'];
                
                moneyText.setText( "$" + player.money);
				//document.getElementById("defender-money").innerHTML = "Money: $" + player.money;
			}
		}
		else if (gTowerType == "bomb") {
			if(player.money < price['bomb']){
				//document.getElementById("defender-money").innerHTML = "Money: $" + player.money + " - Not enough money";
			}
			else{
				canBuy = true;
				player.money -= price['bomb'];
                
                moneyText.setText( "$" + player.money);
				//document.getElementById("defender-money").innerHTML = "Money: $" + player.money;
			}
		}
		
		if(notOnLane && canBuy) {
			//document.getElementById("Tower-Placement-Error").innerHTML = "";
			socket.send('addTower,'+gTowerType+','+mouse_x+','+mouse_y);

            cancelTowerClick(true);
            
            placingTower = false;
		}
	}
}
function cancelTowerClick(killTowerPlacementMap, emptyGTowerType) {
    if (killTowerPlacementMap)
        map.play('plainMap');
    
    if      (gTowerType == 'minigun')   followMouse['minigun'].kill();
    else if (gTowerType == 'shotgun')   followMouse['shotgun'].kill();
    else if (gTowerType == 'gum')       followMouse['gum'].kill();
    else if (gTowerType == 'bomb')      followMouse['bomb'].kill();
    
    if(emptyGTowerType) gTowerType = "";
}
function hoverOverButton(type){
    //console.log("hover over: "+type+type.text+type.toString());
    //console.log("FR button: "+upgradeFireRateButton);
    //console.log("DMG button: "+upgradeDamageButton);

    if (BottomInfoTowerText != undefined)
        BottomInfoTowerText.kill();
    if (BottomInfoTower != undefined)
        BottomInfoTower.kill();
    if (upgradeFireRateButton != undefined)
        upgradeFireRateButton.kill();
    if (upgradeDamageButton != undefined)
        upgradeDamageButton.kill();
    if (fireRateText != undefined)
        fireRateText.kill();
    if (damageText != undefined)
        damageText.kill();

    //fireRateText.kill();
    //damageText.kill();

    var typeFullName = "";
    if      (type == 'standardZombie')    typeFullName = 'Standard Zombie';
    else if (type == 'strongZombie')      typeFullName = 'Strong Zombie';
    else if (type == 'healingZombie')     typeFullName = 'Healing Zombie';
    else if (type == 'generationsZombie') typeFullName = 'Generations Zombie';
    else if (type == 'minigunTower')      typeFullName = 'Minigun Tower';
    else if (type == 'shotgunTower')      typeFullName = 'Shotgun Tower';
    else if (type == 'gumTower')          typeFullName = 'Gum Tower';
    else if (type == 'bombTower')         typeFullName = 'Bomb Tower';

    BottomInfoTowerText = game.add.text(610, 920, typeFullName, {font: "30px Arial", fill: "#F5F5F5", align: "center"});

    BottomInfoTower = game.add.sprite(510, 920, type);
    BottomInfoTower.scale.setTo(0.5);
    //fireRateText = game.add.text(550, 990, 'Fire Rate:  ' + this.fireRate, bottomBoxStyle);
    //damageText = game.add.text(550, 1035, 'Damage:   ' + this.damage, bottomBoxStyle); 

}

function hoverOutButton(){

    if (BottomInfoTowerText != undefined)
        BottomInfoTowerText.kill();
    if (BottomInfoTower != undefined)
        BottomInfoTower.kill();
}

function rescale() {
    // game auto-scale
    game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE; 
    var scaleX = parent.innerWidth / this.game.width; 
    var scaleY = parent.innerHeight / this.game.height; 
    var scaleAxis = scaleX < scaleY ? scaleX : scaleY; 
    game.scale.setUserScale(scaleAxis, scaleAxis, 0, 0); 
}













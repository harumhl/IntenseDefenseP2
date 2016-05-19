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
var alreadyStarted = false;

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
var attackRange;

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
var BottomInfoSprite;
var BottomInfoTowerText;
var bottomUpgradeText;
var towerClicked = false;
var fireRateText;
var damageText;
var zombieHealthText;
var zombieSpeedText;
var zombieDamageText;
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

var endGame = 0;
var matchWinner = {matchOne:"", matchTwo:""};

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
var muted = false;

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

var instructionSheet;
var attackerInstructions;
var defenderInstructions;
var closeInstructionButton;

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
var roundMatchText; // this is used in playState on the map
var playerNames = {attacker:"", defender:""};

var checkone;//images for the green checkmarks
var checktwo; 
/* next 3 lines trying to fix the timer*/
var seconds  = 60;
var current_minutes;
var attackerWon = false;

var continueClicks = 0;
var startEndRound = false;
var continueButton;

var music;
var muteButton;



/*       Classes         */

// Player Class
Player = function(username, state, money, id) {
    this.username = username;
    this.state = state;
	this.money = money;
	this.wins = 0;
	this.ID = id;
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
		this.speed = 5;
	}
	else if(type == 'strong')
	{
		this.damage = 200;
		this.health = 300;
		this.speed = 3;
	}
	else if(type == 'healing')
	{
		this.damage = 50;
		this.health = 500;
		this.speed = 5;
	}
	else
	{
		this.damage = 300;
		this.health = 600;
		this.speed = 2;
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
	
	// (x,y) coordinates for bullet-zombie overlap 
	// - where zombie would be by the time the bullet is supposed to hit the zombie
	if (this.direction == "down") {
		this.x = this.pos_x;
		this.y = (this.pos_y + y_offset) + 27*(bulletTravelTime/1000)*this.speed;
	}
	else if (this.direction == "left") {
		this.x = this.pos_x - 65*(bulletTravelTime/1000)*this.speed;
		this.y = (this.pos_y + y_offset);
	}
	else if (this.direction == "right") {
		this.x = this.pos_x + 60*(bulletTravelTime/1000)*this.speed;
		this.y = (this.pos_y + y_offset);
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
					zombieStatArray.push(new zombieStat(zombieArray[index].lane, zombieArray[index].pos_x+i*20, zombieArray[index].pos_y, 1, 100));
					zombieArray.push(new Zombie('standard', zombieArray[index].lane, zombieArray[index].pos_x+i*20, zombieArray[index].pos_y));
				}
				else if(zombieArray[index].direction == 'right'){
					zombieStatArray.push(new zombieStat(zombieArray[index].lane, zombieArray[index].pos_x-i*20, zombieArray[index].pos_y, 1, 100));
					zombieArray.push(new Zombie('standard', zombieArray[index].lane, zombieArray[index].pos_x-i*20, zombieArray[index].pos_y));
				}
				else{
					zombieStatArray.push(new zombieStat(zombieArray[index].lane, zombieArray[index].pos_x, zombieArray[index].pos_y-i*20, 1, 100));
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
    
	// middle lane advantage
	if (358 <= x && x <= 626.25) {
		var lefttop_y  = x * -0.71359767 + 536.11;
		var righttop_y = x * 0.756740706 - 196.14;
		var leftbot_y  = x * 0.822783351 + 298.91;
		var rightbot_y = x * -0.82268849 + 1106.49335;

		if (lefttop_y < y && righttop_y < y && y < leftbot_y && y < rightbot_y) 
		{
			this.damage *= 2;
		}
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
	
    if (bottomUpgradeText != undefined)
		bottomUpgradeText.kill();
	
    ResetBottomBox();
    
    if(placingTower == true) {
        console.log("placingTower: " + placingTower.toString());
        return; // if player is currently trying to place a tower dont give them the option to try to upgrade
    }
    attackRange.reset(this.pos_x+20, this.pos_y+25);

    if(player.state == 'defender'){
        console.log("upgrade click");
        /* I don't know what this does and this is not helping
        if(towerClicked == true){
            towerClicked = false;
            ResetBottomBox();
            console.log("tower click was true");
            attackRange.kill();
        }
        */
        if(this.type == 'minigun')     
                BottomInfoTowerText = game.add.text(610, 920, "Minigun Tower", bottomBoxTowerNameStyle);
        else if(this.type == 'shotgun')         
                BottomInfoTowerText = game.add.text(610, 920,'Shotgun Tower', bottomBoxTowerNameStyle);
        else if(this.type == 'gum')         
                BottomInfoTowerText = game.add.text(610, 920, 'Gum Tower', bottomBoxTowerNameStyle);
        else  
                BottomInfoTowerText = game.add.text(610, 920,'Bomb Tower', bottomBoxTowerNameStyle);

        BottomInfoSprite = game.add.sprite(510, 920, this.type + 'Tower');
        BottomInfoSprite.scale.setTo(0.5);
        fireRateText = game.add.text(550, 990, 'Fire Rate:  ' + this.fireRate, bottomBoxStyle);
        damageText = game.add.text(550, 1035, 'Damage:   ' + this.damage, bottomBoxStyle);

        if (this.fireRateLevel == 4)
            upgradeFireRateButton = game.add.button(720, 990, 'upgradeMax', function() {}, this, 0,1,2);
        else
            upgradeFireRateButton = game.add.button(720, 990, "upgradeLvl"+this.fireRateLevel, function() {
				var hasMoney = this.checkBalance("fireRate");
				if(hasMoney){ // checks to make sure player has enough money
					upgradeFireRateButton.kill();
					socket.send("upgrade fire rate" + ":"+this.pos_x+":"+this.pos_y+":"+this.type); 
				}
			}, this, 0,1,2);  

        
        if (this.damageLevel == 4) 
            upgradeDamageButton = game.add.button(720, 1035, 'upgradeMax', function() {}, this, 0,1,2);
        else
            upgradeDamageButton = game.add.button(720, 1035, "upgradeLvl"+this.damageLevel, function() {
				var hasMoney = this.checkBalance("damage");
				if(hasMoney){ // checks to make sure player has enough money
					upgradeDamageButton.kill();
					socket.send("upgrade damage rate" + ":"+this.pos_x+":"+this.pos_y+":"+this.type); 
				}
			}, this, 0,1,2);  

        towerClicked = true;
    }
};
Tower.prototype.upgradeFireRate = function(){
    console.log("upgrade fire rate" + ":"+this.pos_x+":"+this.pos_y+":"+this.type+":");

    this.fireRate -= 100;
    if(player.state == 'defender'){
        fireRateText.setText("Fire Rate:  " + this.fireRate);
        
		if(this.fireRateLevel == 1){
			player.money -= 50;
		}
		else if (this.fireRateLevel == 2){
			player.money -= 75;
		}
		else if(this.fireRateLevel == 3){
			player.money -= 100;
		}
		
		this.fireRateLevel += 1;
    
		if (this.fireRateLevel == 4)
			upgradeFireRateButton = game.add.button(720, 990, 'upgradeMax', function() {}, this, 0,1,2);
		else
			upgradeFireRateButton = game.add.button(720, 990, "upgradeLvl"+this.fireRateLevel, function() {

				var hasMoney = this.checkBalance("fireRate");
				if(hasMoney){ // checks to make sure player has enough money
					upgradeFireRateButton.kill();
					socket.send("upgrade fire rate" + ":"+this.pos_x+":"+this.pos_y+":"+this.type); 
				}
			}, this, 0,1,2);  
	}
};

Tower.prototype.upgradeDamage = function(){
    console.log("upgrade damage rate" + ":"+this.pos_x+":"+this.pos_y+":"+this.type+":");
	
    this.damage += 25;
    if(player.state == 'defender'){
        damageText.setText("Damage:   " + this.damage);
		
		if(this.damageLevel == 1){
			player.money -= 50;
		}
		else if (this.damageLevel == 2){
			player.money -= 75;
		}
		else if(this.damageLevel == 3){
			player.money -= 100;
		}
		
		
        this.damageLevel += 1;
		//this.damage += 25;
		
		if (this.damageLevel == 4) 
			upgradeDamageButton = game.add.button(720, 1035, 'upgradeMax', function() {}, this, 0,1,2);
		else
			upgradeDamageButton = game.add.button(720, 1035, "upgradeLvl"+this.damageLevel, function() {
				var hasMoney = this.checkBalance("damage");
				if(hasMoney){ // checks to make sure player has enough money
					upgradeDamageButton.kill();
					socket.send("upgrade damage rate" + ":"+this.pos_x+":"+this.pos_y+":"+this.type); 
				}
			}, this, 0,1,2);  
	}
};


Tower.prototype.checkBalance = function(upgradeType){
	console.log('checkB, damagelevel == ' +this.damageLevel);
	console.log('checkB, fireRateLevl == ' +this.fireRateLevel);
	if(upgradeType == 'damage'){
		if(this.damageLevel == 1 ){
			if(player.money >= 50) {
				console.log("1 --");
				return 1;
			}
			else console.log(' 1 NO MONEY');
		}
		else if (this.damageLevel == 2){
			if(player.money >= 75){
				console.log("2 --");
				return 1;
			}
			else console.log(' 2 NO MONEY');
		}
		else if(this.damageLevel == 3){
			if(player.money >= 100){
				console.log("3 --");
				return 1;
			}
			else console.log(' 3 NO MONEY');
		}
		else 
			return 0;
	}
	else if(upgradeType == 'fireRate'){
		if(this.fireRateLevel == 1){
			if(player.money >= 50) {
				console.log("1 --");
				return 1;
			}
			else console.log(' 1 NO MONEY');
		}
		else if (this.fireRateLevel == 2){
			if(player.money >= 75){
				console.log("2 --");
				return 1;
			}
			else console.log(' 2 NO MONEY');
		}
		else if(this.fireRateLevel == 3){
			if(player.money >= 100){
				console.log("3 --");
				return 1;
			}
			else console.log(' 3 NO MONEY');
		}
		else 
			return 0;
	}
}

function ResetBottomBox(){
    if (BottomInfoTowerText != undefined)   BottomInfoTowerText.kill();
    if (BottomInfoSprite != undefined)       BottomInfoSprite.kill();
    if (fireRateText != undefined)          fireRateText.kill();
    if (damageText != undefined)            damageText.kill();
    if (upgradeFireRateButton != undefined) upgradeFireRateButton.kill();
    if (upgradeDamageButton != undefined)   upgradeDamageButton.kill();
	
	//bottomUpgradeText = game.add.text(560,960,"Click on a tower on the\nmap to start upgrading", bottomBoxStyle);
		
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

function zombieStat(_lane, _pos_x, _pos_y, _speed, _damage) {
	this.lane   = _lane;
	this.pos_x  = _pos_x;
	this.pos_y  = _pos_y;
	this.speed  = _speed;
	this.direction = "";
	this.damage = _damage;
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
				clearTimeout(timeout);
                endRound('defender');   
				return;
                //end of match: defender wins
            }
		}
        if( seconds > 0 ) {
            if(attackerWon){
					current_minutes = 0;
					seconds = 0;
					clearTimeout(timeout);
					return;
			}
			else{
				clearTimeout(timeout);
				timeout = setTimeout(tick, 1000);
			}
        } else {
 
            if(mins > 1){
 
                if(attackerWon){
					current_minutes = 0;
					seconds = 0;
					clearTimeout(timeout);
					return;
				}
				else{
					/*if(attackerWon){
						current_minutes = 0;
						seconds = 0;
						
						//tick();
					}*/
					//else
						clearTimeout(timeout);
						timeout = setTimeout(function () { countdown(mins - 1); }, 1000);
						// countdown(mins-1);   never reach “00″ issue solved:Contributed by Victor Streithorst
				}
            }
        }
    }
	console.log('TICK');
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
function cleanseZombie(index){
	// Killing the zombie and removing it from the arrays
	//zombieArray[index].alive = false;    
	zombieArray[index].image.kill();
	zombieArray.splice(index, 1);
	zombieStatArray.splice(index,1);
}
function damageBase(amount) {
    /*if(zombieArray[index] == undefined) {
        console.log("UNDEFINED zombieArray[" + index + "], zombieArray.length: " + zombieArray.length);
        return;
    }*/
	//console.log('CALLING DAMAGE BASE'+amount);
	baseHealth -= amount;
    //document.getElementById("health").innerHTML = " Health: " + baseHealth; 
	
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
function newRound() {
	for(var i = 0; i<zombieArray.length; i++)
		zombieArray[i].image.kill();
	for(var j = 0; j<towerArray.length; j++)
		towerArray[j].image.kill();
	
	zombieArray = [];
	zombieStatArray = [];
	towerArray = [];
	
	alreadyStarted = false;
	
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
function endRound(winner) {
    if(winner == "attacker"){//		window.alert("Attacker Wins!");
        console.log("Attacker Wins!");
		if(roundMatchNum['match'] == 1)
			matchWinner['matchOne'] = playerNames['attacker'];
		else
			matchWinner['matchTwo'] = playerNames['attacker'];
	}
    else{                   //		window.alert("Defender Wins!");
        console.log("Defender Wins!");
		if(roundMatchNum['match'] == 1)
			matchWinner['matchOne'] = playerNames['defender'];
		else
			matchWinner['matchTwo'] = playerNames['defender'];
	}
	clearTimeout(timeout);
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
		zombieStatArray.push(new zombieStat(lane, spawn_x, spawn_y, 1, 100));
		zombieArray.push(new Zombie(type, lane, spawn_x, spawn_y));
	}
    else if (type == "strong"){
		zombieStatArray.push(new zombieStat(lane, spawn_x, spawn_y, 0.6, 200));
		zombieArray.push(new Zombie(type, lane, spawn_x, spawn_y));
	}
	else if (type == "healing"){
		zombieStatArray.push(new zombieStat(lane, spawn_x, spawn_y, 1, 50));
		zombieArray.push(new Zombie(type, lane, spawn_x, spawn_y));
	}
    else if (type == "generations"){
		zombieStatArray.push(new zombieStat(lane, spawn_x, spawn_y, 0.3, 200));
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
    
    for (var i=0; i < towerNames.length; i++) {
        if (gTowerType == towerNames[i]) {
            followMouse[ towerNames[i] ].reset(870,160*(i+1));
            attackRange.reset(870,160*(i+1));
            break;
        }
    }
    /*
    if      (gTowerType == 'minigun')   followMouse['minigun'].reset(870,160);
    else if (gTowerType == 'shotgun')   followMouse['shotgun'].reset(870,320);
    else if (gTowerType == 'gum')       followMouse['gum'].reset(870,480);
    else if (gTowerType == 'bomb')      followMouse['bomb'].reset(870,640);
    
    attackRange.reset(870,);
    */
    placingTower = true;
    
}
function mouseClick(item) {
	var notOnLane = false;
	var canBuy = false;
    ResetBottomBox();
    attackRange.kill();

	if(player.state == 'defender' && gTowerType != ""){
		
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
            console.log("not on lane");
		}
		
		// Check if the player has enough money for the zombie
        for (var i=0; i < towerNames[i].length; i++) {
            if (gTowerType == towerNames[i]) {
                if (player.money >= price[ towerNames[i] ]) {
                    canBuy = true;
                    break;
                }
            }
        }
        
		if(notOnLane && canBuy) {
			//document.getElementById("Tower-Placement-Error").innerHTML = "";
			socket.send('addTower,'+gTowerType+','+mouse_x+','+mouse_y);

            player.money -= price[gTowerType];
            moneyText.setText( "$" + player.money);

            cancelTowerClick(true, true);
            attackRange.kill();
            
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

function muteMusic(){
	if(music.mute == false){
		music.mute = true;
		muted = true;
		muteButton.setFrames(1);
	}
	else{
		music.mute = false;
		muted = false;
		music.play();
		muteButton.setFrames(0);	
	}

}

function hoverOverButton(type){
    //console.log("hover over: "+type+type.text+type.toString());
    //console.log("FR button: "+upgradeFireRateButton);
    //console.log("DMG button: "+upgradeDamageButton);

    if (BottomInfoTowerText != undefined)
        BottomInfoTowerText.kill();
    if (BottomInfoSprite != undefined)
        BottomInfoSprite.kill();
    if (upgradeFireRateButton != undefined)
        upgradeFireRateButton.kill();
    if (upgradeDamageButton != undefined)
        upgradeDamageButton.kill();
    if (fireRateText != undefined)
        fireRateText.kill();
    if (damageText != undefined)
        damageText.kill();
	if (bottomUpgradeText != undefined)
		bottomUpgradeText.kill();

    //fireRateText.kill();
    //damageText.kill();

    var typeFullName = "";
    if      (type == 'standardZombie'){
		typeFullName = 'Standard Zombie';
		zombieHealthText = game.add.text(600, 970, 'Health: 200', bottomBoxStyle);
		zombieSpeedText  = game.add.text(600, 1005, 'Speed: fast', bottomBoxStyle);
		zombieDamageText = game.add.text(600, 1040, 'Damage: 100', bottomBoxStyle);
	}
    else if (type == 'strongZombie'){
		typeFullName = 'Strong Zombie';
		zombieHealthText = game.add.text(600, 970, 'Health: 300', bottomBoxStyle);
		zombieSpeedText  = game.add.text(600, 1005, 'Speed: normal', bottomBoxStyle);
		zombieDamageText = game.add.text(600, 1040, 'Damage: 200', bottomBoxStyle);
	}
    else if (type == 'healingZombie'){     
		typeFullName = 'Healing Zombie';
		zombieHealthText = game.add.text(600, 970, 'Health: 500', bottomBoxStyle);
		zombieSpeedText  = game.add.text(600, 1005, 'Speed: fast', bottomBoxStyle);
		zombieDamageText = game.add.text(600, 1040, 'Damage: 50', bottomBoxStyle);
	}
    else if (type == 'generationsZombie'){
		typeFullName = 'Generations Zombie';
		zombieHealthText = game.add.text(600, 970, 'Health: 600', bottomBoxStyle);
		zombieSpeedText  = game.add.text(600, 1005, 'Speed: slow', bottomBoxStyle);
		zombieDamageText = game.add.text(600, 1040, 'Damage: 300', bottomBoxStyle);
	}
    else if (type == 'minigunTower'){
		fireRateText = game.add.text(600, 990, 'Fire Rate: 750', bottomBoxStyle);
		damageText = game.add.text(600, 1035, 'Damage: 30', bottomBoxStyle);
		typeFullName = 'Minigun Tower';
	}      
    else if (type == 'shotgunTower') {
		fireRateText = game.add.text(600, 990, 'Fire Rate: 950', bottomBoxStyle);
		damageText = game.add.text(600, 1035, 'Damage: 80', bottomBoxStyle);
		typeFullName = 'Shotgun Tower';
	}
    else if (type == 'gumTower'){
		fireRateText = game.add.text(600, 990, 'Fire Rate: 1000', bottomBoxStyle);
		damageText = game.add.text(600, 1035, 'Damage: Slows Zombies', bottomBoxStyle);
		typeFullName = 'Gum Tower';
	}
    else if (type == 'bombTower'){
		fireRateText = game.add.text(600, 990, 'Fire Rate: 1000', bottomBoxStyle);
		damageText = game.add.text(600, 1035, 'Damage: 150', bottomBoxStyle);
		typeFullName = 'Bomb Tower';
	}
	
	if(type == 'generationsZombie')
		BottomInfoTowerText = game.add.text(575, 920, typeFullName, {font: "27px Arial", fill: "#F5F5F5", align: "center"});
	else
		BottomInfoTowerText = game.add.text(600, 920, typeFullName, {font: "27px Arial", fill: "#F5F5F5", align: "center"});
	
	if(type.indexOf('Z') == -1) // check if the type has the letter Z meaning its a zombie sprite
		BottomInfoSprite = game.add.sprite(510, 920, type);
	else	// here if it is a zombie sprite
		BottomInfoSprite = game.add.sprite(510, 920, type, 9);
		
    BottomInfoSprite.scale.setTo(0.75);

}

function hoverOutButton(){

    if (BottomInfoTowerText != undefined) 	BottomInfoTowerText.destroy();
    if (BottomInfoSprite != undefined) 		BottomInfoSprite.destroy();
	if (fireRateText != undefined)			fireRateText.destroy();
	if (damageText != undefined)			damageText.destroy();
	if (zombieHealthText != undefined) 		zombieHealthText.destroy();
	if (zombieSpeedText != undefined)		zombieSpeedText.destroy();
	if (zombieDamageText != undefined)		zombieDamageText.destroy();
	
	if(player.state == 'attacker'){ // here place the upgraded zombie options
		
	}
	else if (player.state == 'defender'){
		bottomUpgradeText = game.add.text(560,960,"Click on a tower on the\nmap to start upgrading", bottomBoxStyle);
	}
}

function attackerInstructionsHover(){
	instructionSheet.frame = 1;
}

function defenderInstructionsHover(){
	instructionSheet.frame = 2;
}

function instructionsHoverOut(){
	instructionSheet.frame = 0;
}

function rescale() {
    // game auto-scale
    game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE; 
    var scaleX = parent.innerWidth / this.game.width; 
    var scaleY = parent.innerHeight / this.game.height; 
    var scaleAxis = scaleX < scaleY ? scaleX : scaleY; 
    game.scale.setUserScale(scaleAxis, scaleAxis, 0, 0); 
}

function showMousePosition() {
	console.log("x: "+game.input.mousePointer.x+"\ny:"+game.input.mousePointer.y);
}











/* game.js */


// changes

// 733 = map height, 129 = title height
var game = new Phaser.Game(1000, 733+129, Phaser.AUTO, 'IntenseDefense', { preload: preload, create: create, update: update });

// Global Variables

var lane = 'center';

var bulletTravelTime = 450;
var towerBullets;

var baseHealth = 2000;

// Price for Zombies
var standardZombiePrice = 100;
var strongZombiePrice = 200;
var healingZombiePrice = 300;
var generationsZombiePrice = 400;
// Price for Towers
var minigunTowerPrice = 100;
var shotgunTowerPrice = 200;
var gumTowerPrice = 300;
var bombTowerPrice = 400;

// Used to generate money for both players over time
var moneyTimer = 0;
var regenTime = 100;

var startRound = false; // controls the timer and money generator functions

//curtain for the attacker, so attacker wont see where defender is placing towers for 30 seconds
var attackerCurtain;

var player;
var cursors;
var buttonGroup; // array of 4 zombie buttons and 4 tower buttons, and zombit path button
//var zombieGroup; // array of zombies
var towerGroup;  // array of towers
var zombieStatArray = [];
var zombieArray = []; // array of zombies
var towerArray = []; // array of towers
var purchaseLock = false;
var state;
var gTowerType = ""; // flag && global variable for tower placement - g for global

// Classes
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
    this.pos_x = inX; // real positions
	this.pos_y = inY; // "
    this.x = inX; // positions calculated for bullet targeting
    this.y = inY; // "
    this.alive = true;
   	this.time = game.time.now;
	
    //this.created = this.game.time.now;
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
    this.image = game.add.sprite(this.x, this.y, type+'Zombie');
	this.image.animations.add('moveRight',[0,1,2,3],true);
	this.image.animations.add('moveLeft',[4,5,6,7],true);
	this.image.animations.add('moveDown',[8,9,10,11],true);
	this.image.scale.setTo(0.5);
	
    /*
     if      (this.type == "standard") this.y += bulletTravelTime*1 +10; //created*__
     else if (this.type == "strong")   this.y += bulletTravelTime*0.3;
     */
    game.physics.enable(this.image, Phaser.Physics.ARCADE);
};
Zombie.prototype.move = function(newPos_x, newPos_y, newDirection) {
    
	
		/*if(newDirection == 'down')
		{
			if(((newPos_y - this.pos_y)/3) >= 1)
				
		}
		else
		{
			if((abs(newPos_x - this.pos_x)/3) >= 1)
				
		}*/
        this.pos_y = newPos_y;
		this.y = newPos_y;
        this.image.y = newPos_y;
		
		this.pos_x = newPos_x;
		this.x = newPos_x;
		this.image.x = newPos_x;
		//if(this.direction != newDirection)
		//{
			if(newDirection == 'down')
			{
				this.image.animations.play('moveDown',this.speed*10);
				
			}
			else if(newDirection == 'right')
			{
				this.image.animations.play('moveRight',this.speed*10);
			}
			else //newDirection == 'left'
			{
				this.image.animations.play('moveLeft',this.speed*10);
			}
		//}
		this.direction = newDirection;
		
		console.log("direction: "+newDirection);
		console.log(this.direction);
		
		
		if (this.direction == "down") 
		{
			this.y = this.image.y + 60*(bulletTravelTime/1000)*this.speed + 4/Math.sqrt((game.time.now-this.time)/1000);
		}
		else if (this.direction == "left") 
		{
			this.x = this.image.x - 40*(bulletTravelTime/1000)*this.speed - 4/Math.sqrt((game.time.now-this.time)/1000);
			console.log("left: "+this.x+"_"+this.image.x);
		}
		else if (this.direction == "right") 
		{
			this.x = this.image.x + 40*(bulletTravelTime/1000)*this.speed + 4/Math.sqrt((game.time.now-this.time)/1000);
			console.log("right: "+this.x+"_"+this.image.x);
		}

};
Zombie.prototype.hurt = function(damage, index) { // I SHOULD NOT NEED THE 2ND ARG
    this.health -= damage;
    //game.debug.text( "damage!"+this.health,100,450);
    
    if (this.health <= 0) {
        
        this.alive = false;
        
        this.image.kill();
		if(zombieArray[index].type == 'generations'){
			socket.send('defenderMoney 60');
			for(var i = 0; i<2; i++)
			{
				zombieStatArray.push(new zombieStat(zombieArray[index].lane, zombieArray[index].pos_x, zombieArray[index].pos_y-i*20, 100, 1));
				zombieArray.push(new Zombie('standard', zombieArray[index].lane, zombieArray[index].pos_x, zombieArray[index].pos_y-i*20));
			}
		}
		else if(zombieArray[index].type == 'standard')
			socket.send('defenderMoney 20');
		else if(zombieArray[index].type == 'strong')
			socket.send('defenderMoney 40');
		else
			socket.send('defenderMoney 40');
		zombieArray.splice(index, 1);
		zombieStatArray.splice(index,1);
        return true;
    }
    return false;
};
Zombie.prototype.update = function() {};

// Tower Class
Tower = function(type, x, y, spriteName, bullets) {
    this.type = type;
    // this.range = range; // make int if we use distanceBetween - from center
    this.x = x-18;
    this.y = y-18;
    this.game = game;
	this.bullets = towerBullets;
	
	if(type == 'minigun'){
		this.fireRate = 750;
		this.damage = 30;
	}
	else if(type == 'shotgun'){
		this.fireRate = 950;
		this.damage = 80;
	}
	else if(type == 'gum')
	{
		this.fireRate = 1000;
		this.damage = 0;
	}
	else{ // bomb
		this.fireRate = 3000;
		this.damage = 150;
	}
    this.nextFire = 0;
    //console.log(spriteName);
    this.image = game.add.sprite(this.x, this.y, type+'Tower');
    this.image.scale.setTo(0.5);
    
    // this is so the attacker will not see the tower placements 
    if(player.state == 'attacker' && !startRound){
        this.image.sendToBack();
    }
    
    game.physics.enable(this.image, Phaser.Physics.ARCADE);
};
Tower.prototype.attack = function(underAttack) {
   // game.debug.text( "attack..."+this.bullets.countDead(),100,400);
    
    
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
    {
        //game.debug.text( "fire!"+this.bullets.countDead(),100,420);
        
        this.nextFire = this.game.time.now + this.fireRate;
        
        var bullet = this.bullets.getFirstDead();
        
        var offset =36; // should be 36
        bullet.reset(parseInt(this.x)+parseInt(offset), parseInt(this.y)+parseInt(offset));
        
        bullet.rotation = this.game.physics.arcade.moveToObject(bullet, underAttack, 2, bulletTravelTime);
		
        // applying damage to zombie
        //underAttack.hurt(34, bullet, frontIndex);
    }
};
Tower.prototype.update = function() {};

function zombieStat(_lane, _pos_x, _pos_y, _health, _speed)
{
	this.lane = _lane;
	this.pos_x = _pos_x;
	this.pos_y = _pos_y;
	this.health = _health;
	this.speed = _speed;
	this.direction = "";//'down';
}

// Preload stuff for the game like images
function preload() {
    
    game.load.image('title','images/Title.png');
    game.load.image('map','images/map.png');
	game.load.image('base','images/base.png');
    
//images for buttons
    //zombies
	game.load.spritesheet('standardZombieButton', 'images/Zombies/zombieStandardButton.png');
    game.load.spritesheet('strongZombieButton', 'images/Zombies/zombieStrongButton.png');
    game.load.spritesheet('healingZombieButton', 'images/Zombies/zombieHealingButton.png');
    game.load.spritesheet('generationsZombieButton', 'images/Zombies/zombieGenerationsButton.png');
	
	
	//zombie path button
    game.load.spritesheet('zombiePathButton', 'images/generalButtons/zombiePathButton.png', 50,50);
	
    //tower buttons
   game.load.spritesheet('minigunTowerButton', 'images/Towers/towerStandardButton.png');
    game.load.spritesheet('shotgunTowerButton', 'images/Towers/towerShotgunButton.png');
    game.load.spritesheet('gumTowerButton', 'images/Towers/towerGumButton.png');
    game.load.spritesheet('bombTowerButton', 'images/Towers/towerBombButton.png');
	
	
// images for the actual objects on the map
	//towers
	game.load.spritesheet('minigunTower', 'images/Towers/towerStandard.png');
    game.load.spritesheet('shotgunTower', 'images/Towers/towerShotgun.png');
    game.load.spritesheet('gumTower', 'images/Towers/towerGum.png');
    game.load.spritesheet('bombTower', 'images/Towers/towerBomb.png');
	
	game.load.spritesheet('standardZombie', 'images/Zombies/zombieStandard.png', 57,75);
    game.load.spritesheet('strongZombie', 'images/Zombies/zombieStrong.png', 57, 75);
    game.load.spritesheet('healingZombie', 'images/Zombies/zombieHealing.png', 57, 75);
    game.load.spritesheet('generationsZombie', 'images/Zombies/zombieGenerations.png', 57, 75);
    
    //game.load.atlas('zombies', 'zombies.png', 'zombies.json');
    // bullet used for now to shoot from the towers, image will be changed later
    game.load.image('bullet', 'images/bullet.png');
    
    //curtain for the attacker, so attacker wont see where defender is placing towers for 30 seconds
    game.load.image('attckerCurtain', 'images/rectangle.png');

}
function endRound(winner)
{
	if(winner == "attacker")
		window.alert("Attacker Wins!");
	else
		window.alert("Defender Wins!");
    startRound = false;
	newRound();
}
function newRound()
{
	for(var i = 0; i<zombieArray.length; i++)
		zombieArray[i].image.kill();
	for(var j = 0; j<towerArray.length; j++)
		towerArray[j].image.kill();
	zombieArray = [];
	zombieStatArray = [];
	towerArray = [];
}
window.onload = function() {
    var playerName = prompt("Please enter your username:", "username");
  // Create a new WebSocket.
  socket = new WebSocket('ws://compute.cse.tamu.edu:11996', "echo-protocol");
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
             player = new Player(playerName, state, 600);
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
            if(player.state == 'attacker'){
                attackerCurtain.destroy();
                for (var i=0; i< towerArray.length; i++)
                    towerArray[i].image.bringToTop();
            }
            //socket.send(player.state + 'Name ' + player.username);
            //console.log('HERE: '+player.name);
            console.log("StartRound");
            console.log("recieved start round");
            startRound = true;
            console.log('startRound set = to true');
            countdown(5);
            // make the defender place towers 
            //countdown(.30);
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
        else if(message == "defenderPlaceTowers"){
            if(player.state == 'attacker')
                attackerCurtain = game.add.image(0,129,'attckerCurtain');
            socket.send(player.state + 'Name ' + player.username);
            console.log("Defender start placing towers!");
            countdown(.30);
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
/*
	function generationDeath(deathPos_x, deathPos_y, deathLane)
	{
    for(var i = 0; i< generationsBalancer; i++)
    {
	myGameArea.addZombie("standard", deathPos_x, deathPos_y);
        zombies.push({
                     type: "standard",
                     health: 100,
                     speed: 5,
                     position_x: deathPos_x,
                     position_y: deathPos_y,
                     lane: deathLane
                     });
    }	
    document.getElementById("demo").innerHTML = "Num Zombies: " + zombies.length +
    "\n" + "Money left: " + money;  
	}

*/
function sendAddZombie(zombieType){
      //buyZombie(zombieType, "center");
    // double check the player has money for the zombie
    var cantBuyFlag = false;
    if(player.state == 'attacker'){
        if(zombieType == "standard"){
            if( player.money < standardZombiePrice ){
                cantBuyFlag = true;
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money + " - Not enough money";
            }
            else{
                player.money -= 100;
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money;
            }
        }
        if(zombieType == "strong"){
            if( player.money < strongZombiePrice ){
                cantBuyFlag = true;
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money + " - Not enough money";
            }
            else{
                player.money -= 200;
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money;
            }
        }
        if(zombieType == "healing"){
            if( player.money < healingZombiePrice ){
                cantBuyFlag = true;
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money + " - Not enough money";
            }
            else{
                player.money -= 300;
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money;
            }
        }
        if(zombieType == "generations"){
            if( player.money < generationsZombiePrice ){
                cantBuyFlag = true;
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money + " - Not enough money";
            }
            else{
                player.money -= 400;
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money;
            }
        }
		if(!cantBuyFlag){
        socket.send("addZombie"+zombieType);
        console.log("buying zombie");
		}
    }
    
}
function damageBase(index)
{
	console.log(baseHealth+'->');
	baseHealth -= zombieArray[index].damage;
	console.log(baseHealth);
    document.getElementById("health").innerHTML = " Health: " + baseHealth; 
	zombieArray[index].alive = false;    
	zombieArray[index].image.kill();
	zombieArray.splice(index, 1);
	zombieStatArray.splice(index,1);
	if(baseHealth <= 0)
		endRound('attacker');
	if(attackerMoney == 0 && zombieArray.length == 0)
			endRound('defender');
	return true;
}
function create() {
    /* load images on the background */
    game.stage.backgroundColor = "#e5e1db"; // background color for button panel
    game.add.sprite(0,0,'title');
    
    var map = game.add.sprite(144,129,'map');
	var base = game.add.sprite(425,780,'base');
    map.inputEnabled = true;
    map.events.onInputDown.add(mouseClick, this);

    // Creating group objects
    buttonGroup = game.add.group();
  //  zombieGroup = game.add.group();
    towerGroup  = game.add.group();
    
 // Creating each button
    // Zombie Buttons
    var standardZombieButton = game.make.button(40, 160, 'standardZombieButton', function(){sendAddZombie("standard");}, this, 0, 0, 0);
    var strongZombieButton  =  game.make.button(40, 320, 'strongZombieButton', function(){sendAddZombie("strong");}, this, 0, 0, 0);
    var healingZombieButton  =  game.make.button(40, 480, 'healingZombieButton', function(){sendAddZombie("healing");}, this, 0, 0, 0);
    var generationsZombieButton  =  game.make.button(40, 640, 'generationsZombieButton', function(){sendAddZombie("generations");}, this, 0, 0, 0);
    // Tower Buttons
    var minigunTowerButton  =  game.make.button(870, 160, 'minigunTowerButton', function(){buyTower("minigun");}, this, 0, 0, 0);
    var shotgunTowerButton  =  game.make.button(870, 320, 'shotgunTowerButton', function(){buyTower("shotgun");}, this, 0, 0, 0);
    var gumTowerButton  =  game.make.button(870, 480, 'gumTowerButton', function(){buyTower("gum");}, this, 0, 0, 0);
    var bombTowerButton  =  game.make.button(870, 640, 'bombTowerButton', function(){buyTower("bomb");}, this, 0, 0, 0);
    
	if(player.state == 'attacker'){
		//zombie path button (the red arrow on top of map)
		var zombiePathButton = game.make.button(465,160, 'zombiePathButton', changePath, this, 0, 1, 2);
		currentPathFrame = 0;
	}
// Attaching buttons to the screen
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
    
	if(player.state == 'attacker'){
		//zombie path direction button
		buttonGroup.add(zombiePathButton);
	}
	
    // Enabling cursor tracker
    cursors = game.input.keyboard.createCursorKeys();
    
    //  The tower bullet group
    towerBullets = game.add.group();
    towerBullets.enableBody = true;
    towerBullets.physicsBodyType = Phaser.Physics.ARCADE;
    towerBullets.createMultiple(100, 'bullet'); // creating 100 bullet sprites
    
    towerBullets.setAll('anchor.x', 0.5); // center of the object - not topleft
    towerBullets.setAll('anchor.y', 0.5); // center of the object - not topleft
	
	//Price labels for the zombie/tower buttons
	// Style for each text
	var style = {font: "20px Arial", fill: "#29a329", align: "center" };
	//zombie price tags
	var standardZombieText = game.add.text(50, 240, "$100", style);
	var strongZombieText = game.add.text(50, 400, "$200", style);
	var healingZombieText = game.add.text(50, 560, "$300", style);
	var generationsZombieText = game.add.text(50, 720, "$400", style);
	//tower price tags
	var minigunTowerText = game.add.text(885, 240, "$100", style);
	var shotgunTowerText = game.add.text(885, 400, "$200", style);
	var gumTowerText = game.add.text(885, 560, "$300", style);
	var bombTowerText = game.add.text(885, 720, "$400", style);

}
function buyZombie(type) {
    
    if (type == "standard"){
		zombieStatArray.push(new zombieStat(lane, 470, 160, 100, 1));
		var newZombie = new Zombie(type, lane, 470, 160);
		
		zombieArray.push(newZombie);
		//attackerMoney -= 100;
		//if(player.money < standardZombiePrice)
        //player.money -= standardZombiePrice;
	}
    else if (type == "strong"){
		zombieStatArray.push(new zombieStat(lane, 470, 160, 100, 0.6));
		zombieArray.push(new Zombie(type, lane, 470, 160));
		//attackerMoney -= 200;
	}
	else if (type == "healing"){
		zombieStatArray.push(new zombieStat(lane, 470, 160, 100, 1));
		zombieArray.push(new Zombie(type, lane, 470, 160));
		//attackerMoney -= 300;
        // player.money -= strongZombiePrice;
	}
    else if (type == "generations"){
		zombieStatArray.push(new zombieStat(lane, 470, 160, 100, 0.3));
		zombieArray.push(new Zombie(type, lane, 470, 160));
		//attackerMoney -= 400;
        //player.money -= healingZombiePrice;
	}
}
function buyTower(type) {
    /* this turns on the flag only.
     in mouseClick(item){}, it will place a tower if a tower is clicked then click on a map */
    
    gTowerType = type;
}
function mouseClick(item) {
    var validPurchase = false;
    var x_offset = 20;
	var y_offset = 35;
	if(player.state == 'defender'){
		
		//if(validPurchase){
			// game.input.mousePointer.x|y: mouse cursor position.
			// pos_x|y: since tower placement requires topleft corner position, we are adjusting it accordingly to make it centered
			var mouse_x = game.input.mousePointer.x;
			var mouse_y = game.input.mousePointer.y;
			var pos_x = mouse_x - x_offset;
			var pos_y = mouse_y - y_offset;
			console.log("click: "+game.input.mousePointer.x+"_"+game.input.mousePointer.y);
			if(mouse_x >= 201 && mouse_x <= 771 && mouse_y <= 212)
			{
			   //console.log('top rectangle chosen')
				document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths"; 
			}
			else if(mouse_x >= 170 && mouse_x <= 241 && mouse_y >= 162 && mouse_y <= 752)
			{
			   //console.log('left rectangle chosen')
				document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths";
			}
			else if(mouse_x >= (723 - x_offset) && mouse_x <= (774+x_offset) && mouse_y >= 162 && mouse_y <= 752)
			{
			   //console.log('right rectangle chosen')
				document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths";
			}
			else if(mouse_x >= 201 && mouse_x <= 771 && mouse_y >= 650 && mouse_y <= 700)
			{
			   //console.log('bottom rectangle chosen')
				document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths";
			}
			else if(mouse_x >= (465-x_offset) && mouse_x <= (515+x_offset) && mouse_y >= (225) && mouse_y <= 752)
			{
			   //console.log('middle rectangle chosen')
				document.getElementById("Tower-Placement-Error").innerHTML = "Sorry, You can't place towers on the paths";
			}
			else
			{
				// set of if-else stmts validates players moneys with purchase
				if (gTowerType == "minigun") {
					if(player.money < minigunTowerPrice){
						document.getElementById("defender-money").innerHTML = "Money: $" + player.money + " - Not enough money";
					}
					else{
						console.log("money:" + player.money);
						player.money -= minigunTowerPrice;
						console.log("money:" + player.money);
						document.getElementById("defender-money").innerHTML = "Money: $" + player.money;
						validPurchase = true;
					}
				}
				else if (gTowerType == "shotgun") {
					if(player.money < shotgunTowerPrice){
						document.getElementById("defender-money").innerHTML = "Money: $" + player.money + " - Not enough money";
					}
					else{
						player.money -= shotgunTowerPrice;
						document.getElementById("defender-money").innerHTML = "Money: $" + player.money;
						validPurchase = true;
					}
				}
				else if (gTowerType == "gum") {
					if(player.money < gumTowerPrice){
						document.getElementById("defender-money").innerHTML = "Money: $" + player.money + " - Not enough money";
					}
					else{
						player.money -= gumTowerPrice;
						document.getElementById("defender-money").innerHTML = "Money: $" + player.money;
						validPurchase = true;
					}
				}
				else if (gTowerType == "bomb") {
					if(player.money < bombTowerPrice){
						document.getElementById("defender-money").innerHTML = "Money: $" + player.money + " - Not enough money";
					}
					else{
						player.money -= bombTowerPrice;
						document.getElementById("defender-money").innerHTML = "Money: $" + player.money;
						validPurchase = true;
					}
				}
				else
					return;
				
				
				document.getElementById("Tower-Placement-Error").innerHTML = "";
				socket.send('addTower,'+gTowerType+','+pos_x+','+pos_y);
				gTowerType = "";
			}
		//}
	}
}
function changePath(){
    /*
        frame #     Zombie path
            0           center
            3           right
            6           left
    */

    if(currentPathFrame == 0) {
		console.log('right');
        buttonGroup.getAt(8).setFrames(3,4,5);
		lane = 'right';
		console.log('lane: ' + lane);
    }
    else if(currentPathFrame == 3) {
		console.log('left');
        buttonGroup.getAt(8).setFrames(6,7,8);
		lane = 'left';
		console.log('lane: ' + lane);
    }
    else if(currentPathFrame == 6){
		console.log('center');
        buttonGroup.getAt(8).setFrames(0,1,2);
		lane = 'center';
		console.log('lane: ' + lane);
    }
    currentPathFrame = buttonGroup.getAt(8).frame;

}
// function for the timer for each round
function countdown(minutes) {
    var seconds = 60;
    var mins = minutes
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
                //end of match attacker wins
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

function update() {
	//zombieStatArray.push(new zombieStat(lane, 470, 160, 100, 1));
	//zombieArray.push(new Zombie(type, lane, 100, 5, 'standardZombie'));
    
    //gradually add money to both players
    console.log('startRound up:' + startRound);
    if(startRound){
        //console.log('start money accumulation');
        moneyTimer++;
        if(moneyTimer >= regenTime)
        {
            
            if(player.state == 'attacker'){
				player.money += 50;
                document.getElementById("attacker-money").innerHTML = "Money: $" + player.money;
                console.log("money = " + player.money);
            }
            else
                document.getElementById("defender-money").innerHTML = "Money: $" + player.money;
            moneyTimer = 0;
        }
    }
    //else console.log("brokedid");
    
    // Change settings for every zombie elements
    if(state == 'attacker' && zombieStatArray.length > 0){
		if(zombieStatArray.length == (zombieArray.length-1))
		{
			//var createdLane = zombieArray[zombieStatArray.length].lane;
			zombieStatArray.push(new zombieStat(lane, 470, 160, 100, 1))
		}
		var message = JSON.stringify(zombieStatArray);
		//console.log(message);
		socket.send(message);
	}  
    
        //game.debug.text( "update does work"+towerArray.length, 150, 150);
    // Applying tower attacks
    var withinRangeArray = []; // empty array now
    var index = 0;
    offset = 36;
    towerSize = 72; // width and height of towers. towersize / 2 = offset.
    
    for (var i=0; i< towerArray.length; i++) {
        withinRangeArray = [];

        var towerCenterX = parseInt(towerArray[i].x) + parseInt(offset);
        var towerCenterY = parseInt(towerArray[i].y) + parseInt(offset);
        //game.debug.text( "within towerGroup "+towerArray[i].x+"_"+towerArray[i].y+"__"+offset+"_"+towerCenterX+"_"+towerCenterY, 400,400+i*10);
        
        index = 0;
        
        // withinRangeArray = Group.filter(function() {return child.health < 10? true: false;}, true);
        
        // 1. Picking the zombies within range
        // I CAn USE DISTANCEBETWEEN FUNCTION TO GET CIRCULAR ATTACK RANGE
        for (var j=0; j< zombieArray.length; j++) {
			//game.debug.text("for loop ya",200,200);
            var leftRange   = towerCenterX - towerSize *2;
            var rightRange  = towerCenterX + towerSize *2;
            var topRange    = towerCenterY - towerSize *2;
            var bottomRange = towerCenterY + towerSize *2;
           //console.log("position: "+zombieArray[j].image.x+","+zombieArray[j].image.y);
		   //console.log(leftRange+","+rightRange+","+topRange+","+bottomRange);

            if (leftRange < zombieArray[j].image.x && zombieArray[j].image.x < rightRange &&
                topRange  < zombieArray[j].image.y && zombieArray[j].image.y < bottomRange) {
                
                withinRangeArray.push(j);
            }
        }
        
       // game.debug.text( "withinRangeArray size: "+withinRangeArray.length, 100,250+i*20);
        
        //if (withinRangeArray.length > 0)
           // game.debug.text(" first attack: "+withinRangeArray[0].type, 200, 320+i*20);
        
        // 2. Choosing the specific one to attack
        if (withinRangeArray.length == 0) continue;

        var frontIndex = withinRangeArray[0];
        
        var int = 0;
        for (var j=0; j< withinRangeArray.length; j++) {
           // game.debug.text( "frontIndex change: "+frontIndex+"_"+withinRangeArray[j]+"_"+zombieArray[withinRangeArray[j]].type+"_"+zombieArray[withinRangeArray[j]].y +"_"+zombieArray[frontIndex].type, 250,350+i*20);
            
            
            // placed ahead in terms of y-coordinate
            // Instead of having a zombie > frontZombie (then it crashes when they are on top of each other)
            if (zombieArray[withinRangeArray[j]].y - zombieArray[frontIndex].y > 1) {
                //game.debug.text( "new frontIndex: "+withinRangeArray[j], 250,280+i*20);
                frontIndex = withinRangeArray[j];
                int++;
            }
            
             // last x-value changing lane
			 
             else if (zombieArray[withinRangeArray[j]].y == zombieArray[frontIndex].y && zombieArray[frontIndex].y >= 700) { // 700 IS NOT FIXED!!!
             
             // closer to the base in x value
				 if (Math.abs(zombieArray[withinRangeArray[j]].y-485) < Math.abs(zombieArray[frontIndex].y-485)) { // 485 NOT FIXED!!
					frontIndex = withinRangeArray[j];
				 }
			}
			
			// first x-value changing lane
			 else if (zombieArray[withinRangeArray[j]].y == zombieArray[frontIndex].y && zombieArray[frontIndex].y <= 160) { // 160 IS NOT FIXED!!!
				 
				 // further from the zombie factory in x value
				 if (Math.abs(zombieArray[frontIndex].y-485) < Math.abs(zombieArray[j].y-485)) { // 485 NOT FIXED!!
					frontIndex = withinRangeArray[j];
				 }
             }
        }
        
        
        // the debug text below often creates an error
        //game.debug.text( "under attack zombie index (inside withinRangeArray) : "+frontIndex+"_"+withinRangeArray[frontIndex] +"_"+zombieArray[withinRangeArray[frontIndex]].type+"_"+withinRangeArray.length+"_"+int, 150,150);
        
        // 3. attack!
		//console.log("Attack: "+frontIndex);
        
		var overlapped = game.physics.arcade.overlap(towerBullets, zombieArray[frontIndex].image,
                                                function(zombie,bullet){bullet.kill();}, null, this);
        
		if (overlapped) {
			zombieArray[frontIndex].hurt(towerArray[i].damage, frontIndex);
			//towerBullets.getFirstDead().kill();
		}
		
		towerArray[i].attack(zombieArray[frontIndex]);
		
        index++;  

    } // end of for-loop for towerArray

}

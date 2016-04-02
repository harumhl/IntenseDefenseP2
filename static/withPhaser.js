/* game.js */
var game = new Phaser.Game(1000, 733+129, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });
var text;//temp
var bulletTravelTime = 200;
var lane = 'center';
var towerBullets; // temp temp temp

// Zombie Class
Zombie = function(type, lane, health, speed, spriteName) {
    this.type = type;
    this.lane = lane;
    this.health = health;
    this.speed = speed;
    
    //this.position_x = 450;
    this.x = 450+36;
    this.y = 160+36;
    this.alive = true;
    
    //this.created = this.game.time.now;
    
    this.image = game.add.sprite(this.x-36, this.y-36, spriteName);
    /*
     if      (this.type == "standard") this.y += bulletTravelTime*1 +10; //created*__
     else if (this.type == "strong")   this.y += bulletTravelTime*0.3;
     */
    game.physics.enable(this.image, Phaser.Physics.ARCADE);
};
Zombie.prototype.move = function() {
    
    if (this.type == "standard") {
        this.y += 1;
        this.image.y += 1;
    }
    else if (this.type == "strong") {
        this.y += 0.3;
        this.image.y += 0.3;
    }
};
Zombie.prototype.damage = function(damage, bullet) { // I SHOULD NOT NEED THE 2ND ARG
    this.health -= damage;
    game.debug.text( "damage!"+this.health,100,450);
    
    if (this.health <= 0) {
        
        this.alive = false;
        
        this.image.kill();
        bullet.kill();
        
        return true;
    }
    return false;
};
Zombie.prototype.update = function() {};

// Tower Class
Tower = function(type, health, damage, speed, range, x, y, spriteName, bullets, game) {
    this.type = type;
    this.health = health;
    this.damage = damage;
    this.speed = speed;
    // this.range = range; // make int if we use distanceBetween - from center
    this.x = x;
    this.y = y;
    this.bullets = bullets;
    this.game = game;
    this.alive = true;
    this.fireRate = 1000;
    this.nextFire = 0;
    
    this.image = game.add.sprite(this.x, this.y, spriteName);
    
    game.physics.enable(this.image, Phaser.Physics.ARCADE);
};
Tower.prototype.attack = function(underAttack) {
    game.debug.text( "attack..."+this.bullets.countDead(),100,400);
    
    
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
    {
        game.debug.text( "fire!"+this.bullets.countDead(),100,420);
        
        this.nextFire = this.game.time.now + this.fireRate;
        
        var bullet = this.bullets.getFirstDead();
        
        var offset =36; // should be 36
        bullet.reset(parseInt(this.x)+parseInt(offset), parseInt(this.y)+parseInt(offset));
        
        bullet.rotation = this.game.physics.arcade.moveToObject(bullet, underAttack, 500, 500);

        // applying damage to zombie
        underAttack.damage(34, bullet);
    }
};
Tower.prototype.update = function() {};



var player;
var cursors;
var buttonGroup; // array of 4 zombie buttons and 4 tower buttons
var zombieGroup; // array of zombies
var towerGroup;  // array of towers
var zombieStatArray = [];
var zombieArray = []; // array of zombies
var towerArray = []; // array of towers

var state;
var gTowerType = ""; // flag && global variable for tower placement - g for global

function zombieStat(_lane, _pos_x, _pos_y, _health, _speed)
{
	this.lane = _lane;
	this.pos_x = _pos_x;
	this.pos_y = _pos_y;
	this.health = _health;
	this.speed = _speed;
}
/* most of the time you need these next 3 functions to run games */
function preload() {
    //var playerName = prompt("Please enter your name", "name");
    //localStorage.setItem("playerName", playerName);
    
//     var playerName = prompt("Please enter your name", "name");
//    localStorage.setItem("playerName", playerName);
    
    game.load.image('title','images/Title.png');
    game.load.image('map','images/map.png');
//images for buttons
    //zombies
    game.load.spritesheet('standardZombie', 'images/Zombies/zombieStandardButton.png');
    game.load.spritesheet('strongZombie', 'images/Zombies/zombieStrongButton.png');
    game.load.spritesheet('healingZombie', 'images/Zombies/zombieHealingButton.png');
    game.load.spritesheet('generationsZombie', 'images/Zombies/zombieGenerationsButton.png');
    //towers
    game.load.spritesheet('minigunTower', 'images/Towers/towerMinigunButton.png');
    game.load.spritesheet('shotgunTower', 'images/Towers/towerShotgunButton.png');
    game.load.spritesheet('iceTower', 'images/Towers/towerIceButton.png');
    game.load.spritesheet('bombTower', 'images/Towers/towerBombButton.png');
    //zombie path button
    game.load.spritesheet('zombiePathButton', 'images/generalButtons/zombiePathButton.png', 50,50);
    
    //game.load.atlas('zombies', 'zombies.png', 'zombies.json');
    game.load.image('bullet', 'images/bullet.png');

}
window.onload = function() {
  // Create a new WebSocket.
  socket = new WebSocket('ws://compute.cse.tamu.edu:11997', "echo-protocol");
  // Handle messages sent by the server.
  socket.onmessage = function(event) 
	 {
	  var message = event.data;
	 // var type = 'string';
	if(message == 'Attacker'){
		state = 'attacker';
		console.log(state);
		document.getElementById("state").innerHTML = "Attacker";
	}
	else if(message == 'Defender'){
		state = 'defender';
		console.log(state);
		document.getElementById("state").innerHTML = "Defender";
	}
	else if(message == 'Observer'){
		state = 'observer';
		console.log(state);
		document.getElementById("state").innerHTML = "Observer";
	}
	else if(message.length > 9 && message.substring(0,9) == 'addZombie')
		buyZombie(message.substring(9, message.length));
	else if(message == 'incoming')
		incoming = true;
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
				console.log(message[i]);
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
		//console.log(towerType+' '+pos_x+' '+pos_y);
		towerGroup.add( game.add.sprite(pos_x, pos_y,towerType+'Tower') );
		towerArray.push(new Tower(towerType, 100, 34, 5, 0, pos_x, pos_y, 'minigunTower', towerBullets, game));
		
	}
	else
	{
		zombieStatArray = JSON.parse(message);
		var i = 0;
			zombieGroup.forEach(function(zombie) {
			zombie.position.y = zombieStatArray[i].pos_y;
			zombie.position.x = zombieStatArray[i].pos_x;
            i++;            
			}, this);
	}
	 }
}
  function sendAddZombie(zombieType){
      //buyZombie(zombieType, "center");
	if(state == 'attacker')
		socket.send("addZombie"+zombieType);
}
function create() {
    //  Resize our game world to be a 2000 x 2000 square
    //game.world.setBounds(-1000, -1000, 2000, 2000);

    
    /* load images on the background */
    game.stage.backgroundColor = "#e5e1db"; // background color for button panel
    game.add.sprite(0,0,'title');
    
    var map = game.add.sprite(144,129,'map');
    map.inputEnabled = true;
    map.events.onInputDown.add(mouseClick, this);

    // Creating group objects
    buttonGroup = game.add.group();
    zombieGroup = game.add.group();
    towerGroup  = game.add.group();
    
 // Creating each button
    // Zombie Buttons
    var standardZombieButton = game.make.button(40, 160, 'standardZombie', function(){sendAddZombie("standard");}, this, 0, 0, 0);
    var strongZombieButton  =  game.make.button(40, 320, 'strongZombie', function(){sendAddZombie("strong");}, this, 0, 0, 0);
    var healingZombieButton  =  game.make.button(40, 480, 'healingZombie', function(){sendAddZombie("healing");}, this, 0, 0, 0);
    var generationsZombieButton  =  game.make.button(40, 640, 'generationsZombie', function(){sendAddZombie("generations");}, this, 0, 0, 0);
    // Tower Buttons
    var minigunTowerButton  =  game.make.button(870, 160, 'minigunTower', function(){buyTower("minigun");}, this, 0, 0, 0);
    var shotgunTowerButton  =  game.make.button(870, 320, 'shotgunTower', function(){buyTower("shotgun");}, this, 0, 0, 0);
    var iceTowerButton  =  game.make.button(870, 480, 'iceTower', function(){buyTower("ice");}, this, 0, 0, 0);
    var bombTowerButton  =  game.make.button(870, 640, 'bombTower', function(){buyTower("bomb");}, this, 0, 0, 0);
    //zombie path button (the red arrow on top of map)
    var zombiePathButton = game.make.button(465,160, 'zombiePathButton', changePath, this, 0, 1, 2);
    currentPathFrame = 0;
// Attaching buttons to the screen
    //zombie buttons
    buttonGroup.add(standardZombieButton);
    buttonGroup.add(strongZombieButton);
    buttonGroup.add(healingZombieButton);
    buttonGroup.add(generationsZombieButton);
    //tower buttons
    buttonGroup.add(minigunTowerButton);
    buttonGroup.add(shotgunTowerButton);
    buttonGroup.add(iceTowerButton);
    buttonGroup.add(bombTowerButton);
    //zombie path direction button
    buttonGroup.add(zombiePathButton);

    // Enabling cursor tracker
    cursors = game.input.keyboard.createCursorKeys();
    
    //  The tower bullet group
    towerBullets = game.add.group();
    towerBullets.enableBody = true;
    towerBullets.physicsBodyType = Phaser.Physics.ARCADE;
    towerBullets.createMultiple(100, 'bullet'); // creating 100 bullet sprites
    
    towerBullets.setAll('anchor.x', 0.5); // center of the object - not topleft
    towerBullets.setAll('anchor.y', 0.5); // center of the object - not topleft

}
function buyZombie(type) {
    
    if (type == "standard"){
		var zombieTemp = game.add.sprite(470,160,'standardZombie')
		zombieTemp.scale.setTo(.5);
        zombieGroup.add( zombieTemp );
		zombieStatArray.push(new zombieStat(lane, 470, 160, 100, 1));
		zombieArray.push(new Zombie(type, lane, 100, 5, 'standardZombie'));
	}
    else if (type == "strong"){
		var zombieTemp = game.add.sprite(470,160,'strongZombie')
		zombieTemp.scale.setTo(.5);
        zombieGroup.add( zombieTemp );
		zombieStatArray.push(new zombieStat(lane, 470, 160, 200, 1));
		zombieArray.push(new Zombie(type, lane, 200, 2, 'strongZombie'));
	}
	else if (type == "healing"){
		var zombieTemp = game.add.sprite(470,160,'healingZombie')
		zombieTemp.scale.setTo(.5);
        zombieGroup.add( zombieTemp );
		zombieStatArray.push(new zombieStat(lane, 470, 160, 10000, 1));
		zombieArray.push(new Zombie(type, lane, 200, 2, 'healingZombie'));
	}
    else if (type == "generations"){
		var zombieTemp = game.add.sprite(470,160,'generationsZombie')
		zombieTemp.scale.setTo(.5);
        zombieGroup.add( zombieTemp );
		zombieStatArray.push(new zombieStat(lane, 470, 160, 10000, 1));
		zombieArray.push(new Zombie(type, lane, 200, 2, 'generationsZombie'));
	}
    /*
    if (type == "standard")
        zombieArray.push(new Zombie(type, lane, 100, 5, 'standardZombie'));
    else if (type == "strong")
        zombieArray.push(new Zombie(type, lane, 200, 2, 'strongZombie'));
    
    game.debug.text( "zombie pushed", 200,300);
     */
}

function buyTower(type) {
    /* this turns on the flag only.
     in mouseClick(item){}, it will place a tower if a tower is clicked then click on a map */
    
    gTowerType = type;
    
}
function mouseClick(item) {
    
    var offset = 0;
    if (gTowerType == "minigun") {
        offset = 36; // Mouse click is top left corner, changing that to middle      
    }
	else if (gTowerType == "shotgun") {
        offset = 36; // Mouse click is top left corner, changing that to middle      
    }
	else if (gTowerType == "ice") {
        offset = 36; // Mouse click is top left corner, changing that to middle      
    }
	else if (gTowerType == "bomb") {
        offset = 36; // Mouse click is top left corner, changing that to middle      
    }
	else
		return;
	var pos_x = game.input.mousePointer.x-offset;
	var pos_y = game.input.mousePointer.y-offset;
	socket.send('addTower,'+gTowerType+','+pos_x+','+pos_y);
    gTowerType = "";

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

function update() {

    // Change settings for every zombie elements
    if(state == 'attacker' && zombieStatArray.length > 0){
	var message = JSON.stringify(zombieStatArray);
	//console.log(message);
	socket.send(message);
	}

    
    
    // Change settings for every zombie elements
    for (var i=0; i< zombieArray.length; i++) {
        
        if (zombieArray[i].alive == false) {
            zombieArray.splice(i, 1);
            continue;
        }
        
        
        zombieArray[i].move();
        
        game.debug.text( "zombie number "+i+zombieArray[i].type, 20*i, 20*i);
    }
    
    
        game.debug.text( "update does work"+towerArray.length, 150, 150);

    // Applying tower attacks
    var withinRangeArray = []; // empty array now
    var index = 0;
    offset = 36;
    towerSize = 72; // width and height of towers. towersize / 2 = offset.
    
    for (var i=0; i< towerArray.length; i++) {
        withinRangeArray = [];
        
        var towerCenterX = parseInt(towerArray[i].x) + parseInt(offset);
        var towerCenterY = parseInt(towerArray[i].y) + parseInt(offset);
        game.debug.text( "within towerGroup "+towerArray[i].x+"_"+towerArray[i].y+"__"+offset+"_"+towerCenterX+"_"+towerCenterY, 400,400+i*10);
        
        index = 0;
        
        // withinRangeArray = Group.filter(function() {return child.health < 10? true: false;}, true);
        
        // 1. Picking the zombies within range
        // I CAn USE DISTANCEBETWEEN FUNCTION TO GET CIRCULAR ATTACK RANGE
        for (var j=0; j< zombieArray.length; j++) {
			game.debug.text("for loop ya",200,200);
            var leftRange   = towerCenterX - towerSize *5/2;
            var rightRange  = towerCenterX + towerSize *5/2;
            var topRange    = towerCenterY - towerSize *5/2;
            var bottomRange = towerCenterY + towerSize *5/2;
            game.debug.text( "for loop "+towerCenterX+"_"+towerCenterY+"_"+leftRange+"_"+rightRange+"_"+topRange+"_"+bottomRange+"___"+zombieArray[j].x+"_"+zombieArray[j].y, 250,450+i*10);

            if (leftRange < zombieArray[j].x && zombieArray[j].x < rightRange &&
                topRange  < zombieArray[j].y && zombieArray[j].y < bottomRange) {
                
                withinRangeArray.push(j);
            }
        }
        
        game.debug.text( "withinRangeArray size: "+withinRangeArray.length, 100,250+i*20);
        
        if (withinRangeArray.length > 0)
            game.debug.text(" first attack: "+withinRangeArray[0].type, 200, 320+i*20);
        
        // 2. Choosing the specific one to attack
        
        if (withinRangeArray.length == 0) continue;
        
        var frontIndex = withinRangeArray[0];
        
        var int = 0;
        for (var j=0; j< withinRangeArray.length; j++) {
            game.debug.text( "frontIndex change: "+frontIndex+"_"+withinRangeArray[j]+"_"+zombieArray[withinRangeArray[j]].type+"_"+zombieArray[withinRangeArray[j]].y +"_"+zombieArray[frontIndex].type, 250,350+i*20);
            
            
            // placed ahead in terms of y-coordinate
            // Instead of having a zombie > frontZombie (then it crashes when they are on top of each other)
            if (zombieArray[withinRangeArray[j]].y - zombieArray[frontIndex].y > 1) {
                game.debug.text( "new frontIndex: "+withinRangeArray[j], 250,280+i*20);
                frontIndex = withinRangeArray[j];
                int++;
            }
            
             // last x-value changing lane
             else if (zombieArray[withinRangeArray[i]].y == zombieArray[frontIndex].y && zombieArray[frontIndex].y == 700) { // 700 IS NOT FIXED!!!
             
             // closer to the base in x value
				 if (Math.abs(zombieArray[withinRangeArray[i]].y-485) < Math.abs(zombieArray[frontIndex].y-485)) { // 485 NOT FIXED!!
					frontIndex = withinRangeArray[i];
				 }
				 }
				 // first x-value changing lane
				 else if (zombieArray[withinRangeArray[i]].y == zombieArray[frontIndex].y && zombieArray[frontIndex].y == 160) { // 160 IS NOT FIXED!!!
				 
				 // further from the zombie factory in x value
				 if (Math.abs(zombieArray[frontIndex].y-485) < Math.abs(zombieArray[i].y-485)) { // 485 NOT FIXED!!
					frontIndex = withinRangeArray[i];
				 }
             }
        }
        
        
        // the debug text below often creates an error
        //game.debug.text( "under attack zombie index (inside withinRangeArray) : "+frontIndex+"_"+withinRangeArray[frontIndex] +"_"+zombieArray[withinRangeArray[frontIndex]].type+"_"+withinRangeArray.length+"_"+int, 150,150);
        
        // 3. attack!
        var istrue = game.physics.arcade.overlap(towerBullets, zombieArray[frontIndex].image,
                                                 function(zombie,bullet){bullet.kill();}, null, this);
        
        towerArray[i].attack(zombieArray[frontIndex]);
        index++;  
        
    } // end of for-loop for towerArray

}
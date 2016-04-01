/* game.js */

var dudeSprite;

Zombie = function(type, lane) {
    this.type = type;
    this.lane = lane;
}
Zombie.prototype.damage = function(damage) {
    this.health -= damage;
}

var game = new Phaser.Game(1000, 733+129, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

var lane = 'center';
var player;
var cursors;
var buttonGroup; // array of 4 zombie buttons and 4 tower buttons
var zombieGroup; // array of zombies
var towerGroup;  // array of towers
var zombieStatArray = [];
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
     var playerName = prompt("Please enter your name", "name");
    localStorage.setItem("playerName", playerName);
    
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
    // WALKIN' PLAYER
    game.load.spritesheet('dude', 'dude.png', 32, 48);
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
		addTower(towerType, pos_x, pos_y);	
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
	if(state == 'attacker')
		socket.send("addZombie"+zombieType);
}
function create() {
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

    // WALKIN' PLAYER
    game.physics.startSystem(Phaser.Physics.ARCADE);
    player = game.add.sprite(150, 150, 'dude');
    game.physics.arcade.enable(player);
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;
    player.animations.add('left', [0, 1, 2, 3], 4, true);
    player.animations.add('right', [5, 6, 7, 8], 4, true);
    cursors = game.input.keyboard.createCursorKeys();
}
function buyZombie(type) {
    
    if (type == "standard"){
        zombieGroup.add( game.add.sprite(450,160,'standardZombie') );
		zombieStatArray.push(new zombieStat(lane, 450, 160, 10000, 1));
	}
    else if (type == "strong"){
        zombieGroup.add( game.add.sprite(450,160,'strongZombie') );
		zombieStatArray.push(new zombieStat(lane, 450, 160, 10000, 1));
	}
}

function buyTower(type) {
    // this turns on the flag only.
    // in mouseClick(item){}, it will place a tower if a tower is clicked then click on a map
    
    gTowerType = type;
    
}
function mouseClick(item) {
    
    if (gTowerType == "minigun") {
        var offset = 36; // Mouse click is top left corner, changing that to middle
        towerGroup.add( game.add.sprite(game.input.mousePointer.x-offset,
                                        game.input.mousePointer.y-offset,'minigunTower') );
    }
    else return;

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
    
    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;
    
    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -50;
        
        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 50;
        
        player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();
        
        player.frame = 4;
    }
    
}
/* game.js */

var dudeSprite;

var game = new Phaser.Game(1000, 733+129, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

var player;
var cursors;
var buttonGroup;
var zombieGroup;

/* most of the time you need these next 3 functions to run games */
function preload() {
    
    game.load.image('title','images/Title.png');
    game.load.image('map','images/map.png');
    game.load.spritesheet('standardZombie', 'images/Zombies/standardZombie.png');
    game.load.spritesheet('strongZombie', 'images/Zombies/strongZombie.png');
    
    // WALKIN' PLAYER
    game.load.spritesheet('dude', 'dude.png', 32, 48);
}

function create() {
    /* load images on the background */
    game.stage.backgroundColor = "#FFFF00"; // background color for button panel
    game.add.sprite(0,0,'title');
    game.add.sprite(144,129,'map');
    
    // Creating group objects
    buttonGroup = game.add.group();
    zombieGroup = game.add.group();
    
    var standardZombieButton =game.make.button(40, 160,'standardZombie', function(){buyZombie("standard");}, this, 0, 0, 0);
    var strongZombieButton  = game.make.button(40, 320,'strongZombie', function(){buyZombie("strong");}, this, 0, 0, 0);
    
    // Attaching buttons to the screen
    buttonGroup.add(standardZombieButton);
    buttonGroup.add(strongZombieButton);
    
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
    
    if (type == "standard")
        zombieGroup.add( game.add.sprite(450,160,'standardZombie') );
    else if (type == "strong")
        zombieGroup.add( game.add.sprite(450,160,'strongZombie') );
}


function update() {
    
    zombieGroup.forEach(function(zombie) {
                       zombie.position.y += 1;
    }, this);
    
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
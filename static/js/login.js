/*login.js*/
//alert('login');



//var playerName = prompt("Please enter your username:", "username");



var enterHit;
var loginState =
{
	
	create: function()
	{
		console.log('STATE: login');
        enterHit = false;
        
        game.add.sprite(0,0,'title');
		game.stage.backgroundColor = "#000000"; // gray background color

		var standardZombieBankrupt = game.add.sprite(40, 160, 'zombieBankrupt');
		var strongZombieBankrupt = game.add.sprite(40, 320, 'zombieBankrupt');
		var healingZombieBankrupt = game.add.sprite(40, 480, 'zombieBankrupt');
		var generationsZombieBankrupt = game.add.sprite(40, 640, 'zombieBankrupt');
		var minigunTowerBankrupt = game.add.sprite(870, 160, 'minigunBankrupt');
		var shotgunTowerBankrupt = game.add.sprite(870, 320, 'shotgunBankrupt');
		var gumTowerBankrupt = game.add.sprite(870, 480, 'gumBankrupt');
		var bombTowerBankrupt = game.add.sprite(870, 640, 'bombBankrupt');        
        
        var greeting = game.add.text(200, 200, "Welcome to\nIntense Defense\ngame\n\nEnter your username", textStyle);

        usernameText = game.add.text(45, 730, "username: ", textStyle);

        game.input.keyboard.addCallbacks(this, null, null, keyPressed);
        game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR); // ignores spacebar
        
        game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(function () {enterHit = true;;}, this);


	},
    update: function()
    {
        if (keyboardInput)
        {
            //usernameText.destroy();
            //usernameText = game.add.text(10, game.world.centerY, "username: "+username, textStyle);
            usernameText.setText("username: " + username);

            //console.log("username:_"+username+"_");
            
            usernameText.inputEnabled = true;
            //usernameText.events.onInputDown.add(function(){usernameClicked = true;}, this);
            
            keyboardInput = false;
        }
        if (enterHit && username != "" && state != '') {
            if(state == 'attacker')
                player = new Player(username, state, 2000);
            if(state == 'defender')
                player = new Player(username, state, 1000);

                console.log('login: '+player.username + ' ' + player.state);
                socket.send('logged in ' + state);
                game.state.start('matchmaking');
        }
    }
	
	
};

function keyPressed(char) {
    //console.log("pressed:_"+char+"_");
    keyboardInput = true;

    for (var i = 0; i < usernamePossible.length; i++)
    {
        //  If they pressed one of the letters in the word, flag it as correct
        if (char === usernamePossible.charAt(i))
        {
            username += char;
        }
    }
}
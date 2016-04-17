/*login.js*/
//alert('login');



//var playerName = prompt("Please enter your username:", "username");




var loginState =
{
	
	create: function()
	{
		console.log('STATE: login');
        
        var info = game.add.text(10, 200, "click your user name when done", textStyle);

        usernameText = game.add.text(10, game.world.centerY, "username: ", textStyle);

        game.input.keyboard.addCallbacks(this, null, null, keyPressed);
        game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR); // consumes spacebar

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
            usernameText.events.onInputDown.add(function(){usernameClicked = true;}, this);
            
            keyboardInput = false;
        }
        if (usernameClicked && username != "" && state != '') {
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
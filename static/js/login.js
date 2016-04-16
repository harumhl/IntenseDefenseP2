/*login.js*/
//alert('login');



//var playerName = prompt("Please enter your username:", "username");


var usernamePossible = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890 .";
var username = "";
var keyboardInput = false;
var text;
var textStyle = {font: "65px Arial", fill: "#ff0044", align: "left", boundsAlignH: "left", boundsAlignV: "middle"};
var usernameClicked = false;


var loginState =
{
	
	create: function()
	{
		console.log('STATE: login');
        
        var info = game.add.text(10, 200, "click your user name when done", textStyle);

        text = game.add.text(10, game.world.centerY, "username: ", textStyle);

        game.input.keyboard.addCallbacks(this, null, null, keyPressed);
//        game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR); // consumes spacebar

	},
    update: function()
    {
        if (keyboardInput)
        {
            text.destroy();
            text = game.add.text(10, game.world.centerY, "username: "+username, textStyle);

            console.log("username:_"+username+"_");
            
            text.inputEnabled = true;
            text.events.onInputDown.add(function(){usernameClicked = true;}, this);
            
            keyboardInput = false;
        }
        if (usernameClicked && username != "" && state != '') {
                player = new Player(username, state, 2000);
                console.log(player.username + ' ' + player.state);
                game.state.start('matchmaking');
        }
    }
	
	
};
function keyPressed(char) {
    console.log("pressed:_"+char+"_");
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
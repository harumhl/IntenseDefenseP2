/*login.js*/
//alert('login');



//var playerName = prompt("Please enter your username:", "username");



var enterHit;
var backspaceHit;
var loginState =
{

    
    create: function()
	{
		console.log('STATE: login');
        enterHit = false;
        rescale();
        
        game.add.sprite(0,0,'title');
		game.stage.backgroundColor = "#e5e1db"; // gray background color
    
        var textStyle = {font: "65px Arial", fill: "#595959", align: "center", boundsAlignH: "left", boundsAlignV: "middle"};
        var greeting = game.add.text(90, 200, "Welcome to IntenseDefense!\nEnter your username\nand hit Enter to login", textStyle);

        instructionSheet = game.add.sprite(0,0,'instructionSheet');
        instructionSheet.kill();
        
        usernameText = game.add.text(45, 600, "username: ", {font: "40px Arial", fill: "#595959", align: "center", boundsAlignH: "left", boundsAlignV: "middle"});

        game.input.keyboard.addCallbacks(this, null, null, keyPressed);
        game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR); // ignores spacebar
        
        // when user hits enter the enter the game
        game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(function () {enterHit = true;}, this);
        // backspace delete characters
        game.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE).onDown.add(function () {backspaceHit = true;}, this);
        
        
        instructionButtonGroup = game.add.group();
        var instructionButton = game.make.button(775,1000, 'instructionsButton', function(){
            instructionButton.kill();
            instructionSheet.reset(0,0);// = game.add.sprite(0,0,'instructionSheet');
            closeInstructionButton.reset(775,1000);
            usernameText.kill();
        }, this, 0,1,2);
        
        var closeInstructionButton = game.make.button(775,1000, 'closeInstructionsButton', function(){
            instructionSheet.kill(); 
            closeInstructionButton.kill(); 
            instructionButton.reset(775,1000) 
            usernameText.reset(45, 600)
        }, this, 0, 1, 2);
        
        closeInstructionButton.kill();
   
        instructionButtonGroup.add(instructionButton);
        instructionButtonGroup.add(closeInstructionButton);

	},
    update: function()
    {
        rescale();
        if (keyboardInput)
        {
            usernameText.setText("username: " + username);
            
            usernameText.inputEnabled = true;
            
            keyboardInput = false;
        }
        if (backspaceHit && username !="" && state != ''){
            //console.log("backspace: " + username.substring(0,username.length-1));
            username = username.substring(0,username.length-1);
            usernameText.setText("username: " + username);
            backspaceHit = false;
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

function showInstructions(){
    instructionButton.kill();
    instructionSheet.reset(0,0);// = game.add.sprite(0,0,'instructionSheet');
    //var closeInstruction = game.add.text(800,930, "Close instruction sheet", {font: "30px Arial", fill: "#000000", align: "center", boundsAlignH: "left", boundsAlignV: "middle"});
    closeInstructionButton.reset(500, 500);
/*    closeInstruction.anchor.set(0.5);
    closeInstruction.inputEnabled = true;
    closeInstruction.input.enableDrag();
    closeInstruction.events.onInputDown.add(function(){instructionSheet.kill()}, this);*/
}
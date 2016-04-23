/*login.js*/
//alert('login');



//var playerName = prompt("Please enter your username:", "username");



var usernamePossible = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890._"; // possible values for username
var username = ""; // entered username
var usernameText;  // displays the username on screen
var charCount = 0;
var errorText;
var textStyle = {font: "65px Arial", fill: "#595959", align: "center", boundsAlignH: "left", boundsAlignV: "middle"};

// flags
var keyboardInput = false;
var enterHitOnce = 0; // 0 means enter hit none, 1 means once
var backspaceHit;

var loginState =
{
    create: function()
	{
        // login text enter box
        var graphics = game.add.graphics(0, 0);
        graphics.beginFill(0xFFFFFF);
        graphics.lineStyle(1, 0x000000, 1);
        graphics.drawRect(239, 597, 600, 50);
        graphics.endFill();
        
		console.log('STATE: login');
        rescale();
        
        game.add.sprite(0,0,'title');
		game.stage.backgroundColor = "#e5e1db"; // gray background color
            
        var greeting = game.add.text(90, 200, "Welcome to IntenseDefense!\nEnter your username\nand hit Enter to login", textStyle);

        usernameText = game.add.text(45, 600, "username: ", {font: "40px Arial", fill: "#595959", align: "center", boundsAlignH: "left", boundsAlignV: "middle"});

        var loginButton = game.add.button(45,675, 'loginButton', loginClicked, this, 0, 1, 2);
        loginButton.scale.setTo(.75);
                
        game.input.keyboard.addCallbacks(this, null, null, keyPressed);
        game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR); // ignores spacebar
        game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(function () { // hit enter
            if(enterHitOnce == 0) enterHitOnce = 1;}, this);
        game.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE).onDown.add(function () { // hit backspace
            backspaceHit = true;}, this);
        
        errorText = game.add.text(239,597, "Sorry you reached the max length of the username (12 characters)", {font: "25px Arial", fill: "#595959", align: "center", boundsAlignH: "left", boundsAlignV: "middle"});
        errorText.kill()
       
        instructionSheet = game.add.sprite(0,0,'instructionSheet');
        instructionSheet.kill();
        
        var instructionButton = game.add.button(775,1000, 'instructionsButton', function(){
            instructionButton.kill();
            instructionSheet.reset(0,0);// = game.add.sprite(0,0,'instructionSheet');
            closeInstructionButton.reset(775,1000);
			attackerInstructions.reset(250, 1000);
			defenderInstructions.reset(500,1000);
            usernameText.kill();
        }, this, 0,1,2);
        
        var closeInstructionButton = game.add.button(775,1000, 'closeInstructionsButton', function(){
            instructionSheet.kill(); 
            closeInstructionButton.kill(); 
            instructionButton.reset(775,1000);
			attackerInstructions.kill();
			defenderInstructions.kill();
            usernameText.reset(45, 600);
        }, this, 0, 1, 2);
        
        closeInstructionButton.kill();
		
		attackerInstructions = game.add.button(250, 1000, 'attackerInstructionButton', function(){}, this, 0,1);
		attackerInstructions.onInputOver.add(attackerInstructionsHover,this);
		attackerInstructions.onInputOut.add(instructionsHoverOut,this);
		attackerInstructions.inputEnabled = true;
		attackerInstructions.kill();
		
		defenderInstructions = game.add.button(500, 1000, 'defenderInstructionButton', function(){}, this, 0,1);
		defenderInstructions.onInputOver.add(defenderInstructionsHover,this);
		defenderInstructions.onInputOut.add(instructionsHoverOut,this);
		defenderInstructions.inputEnabled = true;
		defenderInstructions.kill();
   },
    update: function()
    {
        rescale();

        if(errorText.exists)
        {
            if(charCount < 12){
                errorText.kill();
            }
        }
        if (keyboardInput)
        {
            usernameText.setText("username: " + username);
            
            usernameText.inputEnabled = true;
            
            keyboardInput = false;
        }
        if (backspaceHit && username !=""){
            username = username.substring(0,username.length-1);
            usernameText.setText("username: " + username);
            backspaceHit = false;
            --charCount;
        }
        if (enterHitOnce == 1 && username != "") {
            loginClicked();
            enterHitOnce = 2;
        }
        if (username != "" && state != undefined) {
            if(state == 'attacker'){
                player = new Player(username, state, 2000);
				socket.send('attackerName ' + username);
			}
            if(state == 'defender'){
                player = new Player(username, state, 1000);
				socket.send('defenderName ' + username);
			}

            console.log('login: '+player.username + ' ' + player.state);
            game.state.start('matchmaking');
        }
    }
};

function keyPressed(char) {
    keyboardInput = true;

    for (var i = 0; i < usernamePossible.length; i++)
    {
        //  If they pressed one of the letters in the word, flag it as correct
        if (char === usernamePossible.charAt(i))
        {
            ++charCount;
            if(charCount > 12){
                errorText.reset(239,690);
                --charCount;
                //console.log("H "+charCount);
                
            }
            else{
                
                
                //console.log(charCount);
                username += char;
                
            }
        }
    }
}

function showInstructions(){
    instructionButton.kill();
    instructionSheet.reset(0,0);
    closeInstructionButton.reset(500, 500);
}

function loginClicked(){
    if (username == "") return; // not enough info for login
    
    socket.send('logged in');
}
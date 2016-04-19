/* matchResults.js */
var continueText;
var continueClicked = false;
matchResultsState = 
{
	preload: function()
	{
        rescale();
	},
	create: function()
	{
        console.log('STATE: matchResults');
        
        defenderPlaceTowers = false;

        // Present a winner.png and loser.png to the appropriate players
        var winnerText;
        if(winner == "attacker")
            winnerText = game.add.text(45, 600, "Match 1 ends.\nAttacker Wins!", {font: "40px Arial", fill: "#595959", align: "center", boundsAlignH: "left", boundsAlignV: "middle"});
        else
            winnerText = game.add.text(45, 600, "Match 1 ends.\nDefender Wins!", {font: "40px Arial", fill: "#595959", align: "center", boundsAlignH: "left", boundsAlignV: "middle"});

        // Store who won the game like player.win = 1; in server
        
		
        console.log("matchNum: "+matchNum);
        
        if (matchNum == 1)
            socket.send('switchRoles');

        if (matchNum == 2) {
            matchNum = 0;
            game.state.start('endRound');
        }
        continueText = game.add.text(700, 600, "click to continue", {font: "40px Arial", fill: "#595959", align: "center", boundsAlignH: "left", boundsAlignV: "middle"});
        continueText.inputEnabled = true;
        continueText.events.onInputDown.add(function(){continueClicked = true;}, this);
	},
	update: function()
	{
        rescale();
        
        if (matchNum == 1) {
            
            if (roleSwitched && continueClicked) {
                socket.send('logged in ' + state);
                game.state.start('playMatch');
            }
        }

	}
};
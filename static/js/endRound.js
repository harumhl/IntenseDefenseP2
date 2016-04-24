/* endRound.js */










// bug with endmatch end of match 2 one clinet can clikc continue button twice and it goes to end round state






endRoundState = 
{
	preload: function()
	{
        rescale();
	},
	create: function()
	{
		/*
			- present relative information about previous 2 matches
				-> who won which round
				-> whatever stats we feel need to be presented

           - if a player won both matches
                game.state.start('endGame');
         
              else 
                socket.send('switchRoles');
                // clean up current game
                game.state.start('play');
		*/
		
		
		game.add.sprite(0,0,'title');
		
		var endRoundTitleStyle = { font: "bold 60px Arial", fill: "#595959"};
		var endRoundTitle = game.add.text(320,135,"Round Results", endRoundTitleStyle);
		
		var roundMatchStyle = { font: "25px Arial", fill: "#595959"};
		game.add.text(445,215,"Round " + roundMatchNum['round'], roundMatchStyle);
		
		
	/* Match 1 results */
		var match1Text = game.add.text(0, 0, "Match 1", { font: "bold 50px Arial", fill: "#595959"});
        match1Text.setTextBounds(190,340, 120, 50);
		
		var match1WinnerText = game.add.text(0, 0, "Winner", { font: "35px Arial", fill: "#006600"});
        match1WinnerText.setTextBounds(210,400, 120, 50);
		
		// display winner of round one
		game.add.text(225, 440, matchWinner['matchOne'], { font: "25px Arial", fill: "#595959"});
		

	/* Match 2 results */
		var match2Text = game.add.text(0, 0, "Match 2", { font: "bold 50px Arial", fill: "#595959"});
        match2Text.setTextBounds(670,340, 120, 50);
		
		var match2WinnerText = game.add.text(0, 0, "Winner", { font: "35px Arial", fill: "#006600"});
        match2WinnerText.setTextBounds(690,400, 120, 50);
		
		
		// display winner of round two
		game.add.text(705, 440, matchWinner['matchTwo'], { font: "25px Arial", fill: "#595959"});
		
		
		
		//=====================================================================
		/*
        console.log('STATE: endRound');
        var winnerText;
        if(winner == "attacker")
            winnerText = game.add.text(45, 600, "A round ended.\nAttacker Wins!", {font: "40px Arial", fill: "#595959", align: "center", boundsAlignH: "left", boundsAlignV: "middle"});
        else
            winnerText = game.add.text(45, 600, "A round ended.\nDefender Wins!", {font: "40px Arial", fill: "#595959", align: "center", boundsAlignH: "left", boundsAlignV: "middle"});
        */
		
		if(Math.abs(endGame) >= 2){
			if(endGame > 0){
				if(player.ID > 0)
					console.log('You win');
				else
					console.log('Opponent Wins');
			}				
			else{
				if(player.ID < 0)
					console.log('You win');
				else
					console.log('Opponent Wins');
			}
		}
		else{
			console.log('Start a new round');
			if(player.state == 'attacker'){
				startNewMatch();
			}
			else{
				
				console.log('WAITTTTTTTT');
				setTimeout(startNewMatch(), 2000);
			}
			
		}
		
		
	},
	update: function()
	{
        rescale();
	}  
};

function startNewMatch(){
	console.log('start new match');
	if(player.state == 'defender'){
		socket.send('startNewRound');
	}
	game.state.start('playMatch');
}
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
		
		game.add.sprite(0,0,'title');
		
		var endRoundTitleStyle = { font: "bold 60px Arial", fill: "#595959"};
		var endRoundTitle = game.add.text(320,135,"Round Results", endRoundTitleStyle);
		var clickedAlready = false;
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
		
		//display random images just because why not
		var tempSprite = game.add.sprite(400, 600,'standardZombie',9);
		tempSprite.scale.setTo(1.5);
		var tempSprite2 = game.add.sprite(525, 575, 'minigunTower');
		tempSprite2.scale.setTo(1.5);


		// displa who won the round or tie
		if(matchWinner['matchOne'] == matchWinner['matchTwo']){
			game.add.image(250, 800, "winner");
		}
		else{
			game.add.image(240, 800, "tie");	
		}



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
			continueButton = game.add.button(405,975, 'continueButton',function(){
				console.log("BEFORE");
				if(player.state == 'attacker'){
					socket.send('addCheckAtt');
					console.log('check 1');
				}
				else if(player.state == 'defender'){
					socket.send('addCheckDef');
					console.log('check 2');
				}
				startRound = false;
				matchOver = true;
				alreadyStarted = false;
				continueClicked = true;
				defenderPlaceTowers = false;
				console.log("send clicks");
				if(!clickedAlready){
					socket.send("incrementClicksRound");
					clickedAlready = true;
				}

						

					}, this, 0, 1, 2);
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
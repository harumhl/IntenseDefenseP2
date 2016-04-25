endGameState = 
{
	preload: function()
	{
        rescale();
	},
	create: function()
	{
		
		game.add.sprite(0,0,'title');
		
		
		var opponentName;
		if(playerNames['attacker'] == player.username)
			opponentName = playerNames['defender']
		else
			opponentName = playerNames['attacker'];
		
			if(endGame > 0){
				if(player.ID > 0){
					console.log('You win');
					var winner = game.add.sprite(0,100,"winner");
					winner.scale.setTo(2);
					game.add.text(500,350, player.username, { font: "25px Arial", fill: "#595959"});
					var loser = game.add.sprite(300,600,"loser");
					//loser.scale.setTo(1.5);
					game.add.text(500,800, opponentName, { font: "25px Arial", fill: "#595959"});
				}				
				else{
					console.log('Opponent wins');
					var winner = game.add.sprite(300,600,"winner");
					//winner.scale.setTo(1.5);
					game.add.text(500,800, opponentName, { font: "25px Arial", fill: "#595959"});
					var loser = game.add.sprite(0,100,"loser");
					loser.scale.setTo(2);
					game.add.text(500,350, player.username, { font: "25px Arial", fill: "#595959"});
				}
			}				
			else{
				if(player.ID > 0){
					console.log('You win');
					var winner = game.add.sprite(0,100,"winner");
					winner.scale.setTo(2);
					game.add.text(500,350, player.username, { font: "25px Arial", fill: "#595959"});
					var loser = game.add.sprite(300,600,"loser");
					//loser.scale.setTo(1.5);
					game.add.text(500,800, opponentName, { font: "25px Arial", fill: "#595959"});
				}				
				else{
					console.log('Opponent wins');
					var winner = game.add.sprite(300,600,"winner");
					//winner.scale.setTo(1.5);
					game.add.text(500,800, opponentName, { font: "25px Arial", fill: "#595959"});
					var loser = game.add.sprite(0,100,"loser");
					loser.scale.setTo(2);
					game.add.text(500,350, player.username, { font: "25px Arial", fill: "#595959"});
				}
			}
	},
	update: function()
	{
        rescale();
	}
};
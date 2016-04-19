/* endRound.js */

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

            socket.send('endRound'); -> check if a player won both matches?

           - if a player won both matches
                game.state.start('endGame');
         
              else 
                socket.send('switchRoles');
                // clean up current game
                game.state.start('play');
		*/
        console.log('STATE: endRound');
        var winnerText;
        if(winner == "attacker")
            winnerText = game.add.text(45, 600, "A round ended.\nAttacker Wins!", {font: "40px Arial", fill: "#595959", align: "center", boundsAlignH: "left", boundsAlignV: "middle"});
        else
            winnerText = game.add.text(45, 600, "A round ended.\nDefender Wins!", {font: "40px Arial", fill: "#595959", align: "center", boundsAlignH: "left", boundsAlignV: "middle"});
        
	},
	update: function()
	{
        rescale();
	}  
};
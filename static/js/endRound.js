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
        
	},
	update: function()
	{
        rescale();
	}  
};
/* matchmaking.js */

matchmakingState = 
{
	preload: function()
	{

	},
	create: function()
	{

		/* 
			- show image that we are waiting for another player to join
			- once 2nd player is joind change the text, show who is connected, ex:
					-> player 1: Brandon
					-> player 2: Boo Boo
		*/
        //matchNum++;
		game.state.start('playMatch');
	},

	update: function()
	{

	}
	
};
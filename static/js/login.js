/*login.js*/
//alert('login');



//var playerName = prompt("Please enter your username:", "username");




var loginState = 
{
	
	create: function()
	{
		console.log('STATE: login');
		game.state.start('matchmaking');
	}
	
	
};
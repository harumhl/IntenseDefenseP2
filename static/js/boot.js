/* boot.js 

	- start physics system and other things like this
*/
//alert('boot');
var bootState = 
{
	create: function()
	{
		console.log('STATE: boot');
		// load the physics engine
		game.physics.startSystem(Phaser.Physics.ARCADE);
		
		// call load state
		game.state.start('load');
	}
};
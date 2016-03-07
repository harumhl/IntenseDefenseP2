window.addEventListener("load",function() 
{
	var Q = window.Q = Quintus()
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX")
		 .setup({ maximize: true })
		 .controls().touch()
	Q.Sprite.extend("Player",
	{
		init: function(p) 
		{
			this._super(p, 
			{
			  sheet: "player",  // Setting a sprite sheet sets sprite width and height
			  jumpSpeed: -400,
			  speed: 300
			});
			
			 this.add('2d, platformerControls');

			this.on("hit.sprite",function(collision) 
			{
				if(collision.obj.isA("Tower")) 
				{
					Q.stageScene("endGame",1, { label: "You Won!" }); 
					this.destroy();
				}
			});
		}
	});
	Q.Sprite.extend("Tower", 
	{
		init: function(p) 
		{
			this._super(p, { sheet: 'tower' });
		}
	});
	Q.Sprite.extend("Enemy",
	{	
	  init: function(p) 
	  {
		this._super(p, { sheet: 'enemy', vx: 100, visibleOnly: true });

		this.add('2d, aiBounce');

		this.on("bump.left,bump.right,bump.bottom",function(collision) 
		{
		  if(collision.obj.isA("Player")) 
		  { 
			Q.stageScene("endGame",1, { label: "You Died" }); 
			collision.obj.destroy();
		  }
		});
		this.on("bump.top",function(collision) 
		{
		  if(collision.obj.isA("Player")) 
		  { 
			this.destroy();
			collision.obj.p.vy = -300;
		  }
		});
	  }
	});
	Q.scene("level1",function(stage) 
	{
	  Q.stageTMX("level1.tmx",stage);
	  stage.add("viewport").follow(Q("Player").first());
	});
	Q.scene('endGame',function(stage) 
	{
	  var container = stage.insert(new Q.UI.Container(
	  {
		x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
	  }));

	  var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
													  label: "Play Again" }))         
	  var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
													   label: stage.options.label }));
	  button.on("click",function() 
	  {
		Q.clearStages();
		Q.stageScene('level1');
	  });

	  container.fit(20);
	});
	Q.loadTMX("level1.tmx, sprites.json", function() 
	{
	  Q.compileSheets("sprites.png","sprites.json");
	  Q.stageScene("level1");
	});
});
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
		music.stop();
		defenderPlaceTowers = false;
        game.add.sprite(0,0,'title');
        var endMatchTitleStyle = { font: "bold 60px Arial", fill: "#595959"};//boundsAlignH: "center", boundsAlignV: "middle" };
        var roundMatchStyle = { font: "25px Arial", fill: "#595959"};//, boundsAlignH: "center", boundsAlignV: "middle" };
        var endMatchTitle = game.add.text(320,135,"Match Results", endMatchTitleStyle);
        
        game.add.text(405,215,"Round " + roundMatchNum['round'] + " Match " + roundMatchNum['match'], roundMatchStyle);
        
        
        
        /* attacker stats (left side) */
        
        var attName = game.add.text(0, 0,/*player.username*/playerNames['attacker'], { font: "bold 40px Arial", fill: "#595959", boundsAlignH: "center", boundsAlignV: "middle" });
        attName.setTextBounds(200, 300, 120, 50);
        var attackertext = game.add.text(0, 0, "Attacker", { font: "35px Arial", fill: "#595959"});
        attackertext.setTextBounds(190,340, 120, 50);
        // show the 4 zombie types and display how many the attacker used in the previous match
        game.add.sprite(100, 450, "standardZombie", 9); // 9 is the frame to show
        game.add.text(175,475, "X " + zombieCount['standard'], { font: "25px Arial", fill: "#595959"});

        game.add.sprite(300, 450, "strongZombie", 9); // 9 is the frame to show
        game.add.text(375,475, "X " + zombieCount['strong'], { font: "25px Arial", fill: "#595959"});

        game.add.sprite(100, 600, "healingZombie", 9); // 9 is the frame to show
        game.add.text(175,625, "X " + zombieCount['healing'], { font: "25px Arial", fill: "#595959"});
        
        game.add.sprite(300, 600, "generationsZombie", 9); // 9 is the frame to show
        game.add.text(375,625, "X " + zombieCount['generations'], { font: "25px Arial", fill: "#595959"});

        //display how much time was left when match ended
        //game.add.text(150, 750, "Time left: 8:88", {font: "30px Arial", fill: "#000000", align: "left" });
        
            
        
        
        /* defender stats (right side) */
        console.log("defenders name: " + playerNames['defender']);
        var attName = game.add.text(0, 0, /*player.username*/playerNames['defender'], { font: "bold 40px Arial", fill: "#595959", boundsAlignH: "center", boundsAlignV: "middle" });
        attName.setTextBounds(680, 300, 120, 50);
        var attackertext = game.add.text(0, 0, "Defender", { font: "35px Arial", fill: "#595959"});
        attackertext.setTextBounds(670,340, 120, 50);
		
        var minigunTower = game.add.sprite(600,450,"minigunTower");
        minigunTower.scale.setTo(0.75);
        game.add.text(680,475, "X " + towerCount['minigun'], { font: "25px Arial", fill: "#595959"});
        
        var shotgunTower = game.add.sprite(800, 450, "shotgunTower"); 
        shotgunTower.scale.setTo(0.75);
        game.add.text(875,475, "X " + towerCount['shotgun'], { font: "25px Arial", fill: "#595959"});
        
        var gumTower = game.add.sprite(600,600,"gumTower");
        gumTower.scale.setTo(0.75);
        game.add.text(680,625, "X " + towerCount['gum'], { font: "25px Arial", fill: "#595959"});
        
        var bombTower = game.add.sprite(800, 600, "bombTower"); 
        bombTower.scale.setTo(0.75);
        game.add.text(875,625, "X " + towerCount['bomb'], { font: "25px Arial", fill: "#595959"});
        
        //display health bar
		if(winner == "attacker")
		{
			//store the winners name
			if(roundMatchNum['match'] == 1)
				matchWinner['matchOne'] = playerNames['attacker'];
			else
				matchWinner['matchTwo'] = playerNames['attacker'];
			
            game.add.sprite(605, 740, "baseHealth", 13);
            game.add.text(608,777,"Health: 0", baseHealthStyle);
			game.add.text(125, 750, "Time left: " + endTime, {font: "30px Arial", fill: "#000000", align: "left" });
        }
        else{
			//store the winners name
			if(roundMatchNum['match'] == 1)
				matchWinner['matchOne'] = playerNames['defender'];
			else
				matchWinner['matchTwo'] = playerNames['defender'];
			
            game.add.sprite(605, 740, "baseHealth", endHealth);
            game.add.text(608,777,"Health: "+baseHealth, baseHealthStyle);
			game.add.text(125, 750, "Time left: 0:00", {font: "30px Arial", fill: "#000000", align: "left" });
        }
		
		// display winner and loser img        
        //attack game.add.image(0, 800, "winner");
        //attack game.add.image(0,800, "loser");
        //game.add.image(495, 800, "loser");
        //game.add.image(495, 800, "winner");
        if(winner == "attacker"){
            game.add.image(0, 800, "winner");
            game.add.image(495, 800, "loser");
        }
        else{
            game.add.image(0,800, "loser");
            game.add.image(495, 800, "winner");
        }
		
		
		
        // Store who won the game like player.win = 1; in server
        //player.matchWin += 1;
		
		
		
		console.log("matchNum: "+roundMatchNum['match']);
		var clickedAlready = false;
		
		if (roundMatchNum['match'] == 1){
            socket.send('switchRoles');
            console.log("switch Roles");
			
			// button to click when user is ready to continue to next match/round
			if(player.state == 'defender'){ // at this point this is the NEW DEFENDER (attacker on the screen)
				continueButton = game.add.button(405,975, 'continueButton',function(){
					console.log("BEFORE");
					if(player.state == 'attacker' && !clickedAlready){
						socket.send('addCheckAtt');
						console.log('check 1');
						clickedAlready = true;
						continueClicked = true;
					}
					else if(player.state == 'defender' && !clickedAlready){
						socket.send('addCheckDef');
						console.log('check 2');
						clickedAlready = true;
						continueClicked = true;
					}
					
					
		
				}, this, 0, 1, 2);
				
			}
        }
		
        if (roundMatchNum['match'] == 2) {
			//socket.send('switchRoles');
            //console.log("switch Roles");
			
			// this did not fix it
			
			// button to click when user is ready to continue to next match/round
			//if(player.state == 'defender'){ // at this point this is the CURRENT DEFENDER
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
					
					
					
					console.log("send clicks");
					if(!clickedAlready){
						continueClicked = true;
						socket.send("incrementClicks");
						clickedAlready = true;
					}

					

				}, this, 0, 1, 2);
			//}
		}

	},
	
	update: function()
	{
        rescale();
        
	if (roundMatchNum['match'] == 1) {
            
            if (roleSwitched && continueClicked) {
                console.log("logged in again..");
                socket.send('logged in');
				continueClicked = false;

                game.state.start('playMatch');
             }
        }

		if(startEndRound){
				//socket.send('logged in');
				continueClicked = false;
				startEndRound = false;
				if(matchWinner['matchOne'] == matchWinner['matchTwo']){
					console.log('winner = '+matchWinner['matchOne']);
					if(matchWinner['matchOne'] == player.username)
						endGame += player.ID;
					else
						endGame -= player.ID;
				}
				else
					console.log('tie');
				roundMatchNum['match'] = 0;
				//roundMatchNum['round'] += 1;
				game.state.start('endRound');
				
			}


	}
};

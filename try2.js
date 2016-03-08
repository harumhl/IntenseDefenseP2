
//class Zombie {}

var money = 1000;
var zombies = [];
var towers = [];
var x_positions = [60,90,120,150,180,210,240,270,300,330,360,390,420, 420,420,420,420,420,420,420];
var y_positions = [40,40,40,40,40,40,40,40,40,40,40,40,40, 70,100,130,160,190,220,250];
var myGameArea;

// Object constructor function
function Zombie(type, health, speed, position_x, position_y, position_index) {
    this.type = type;
    this.health = health;
    this.speed = speed;
    this.position_x = position_x;
    this.position_y = position_y;
    this.position_index = position_index;
    
    this.damage = function (damages) {
        this.health -= damages;
    };
}
function Tower(type, health, attack_speed, position_x, position_y) {
    this.type = type;
    this.health = health;
    this.attach_speed = attach_speed;
    this.position_x = position_x;
    this.position_y = position_y;
    
}
myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 480;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        //this.frameNo = 0;
        //this.interval = setInterval(updateGameArea, 20);
        
        //this.context.fillStyle = "yellow";
        //this.context.fillRect(30,30,30,30);
    },
    clear : function() {
        this.context.clearRect(0,0,480,270);
    },
    moveWhere : function(x, y, type) {
        if      (type == "standard")    this.context.fillStyle = "blue";
        else if (type == "strong")      this.context.fillStyle = "green";
        else                            this.context.fillStyle = "red";
        
        if (x == undefined || y == undefined) return;
        this.context.fillRect((x||150),(y||30),30,30);
    },
    addZombie : function(type) {
        if      (type == "standard")    this.context.fillStyle = "blue";
        else if (type == "strong")      this.context.fillStyle = "green";
        else                            this.context.fillStyle = "red";
        
        this.context.fillRect(30,30,30,30);
    }
}

function addStandardZombie() {
    if (money < 100) {
        window.alert("Not Enough Money");
        return;
    }
    myGameArea.addZombie("standard");
    zombies.push({
                 type: "standard",
                 health: 100,
                 speed: 5,
                 position_x: 0,
                 position_y: 0,
                 position_index: 0
                 });
    money -= 100;
    document.getElementById("demo").innerHTML = "Num Zombies: " + zombies.length +
    "\n" + "Money left: " + money;
}
function addStrongZombie() {
    if (money < 200) {
        window.alert("Not Enough Money");
        return;
    }
    myGameArea.addZombie("strong");
    zombies.push({
                 type: "strong",
                 health: 300,
                 speed: 2,
                 position_x: 0,
                 position_y: 0,
                 position_index: 0
                 });
    money -= 200;
    document.getElementById("demo").innerHTML = "Num Zombies: " + zombies.length +
    "\n" + "Money left: " + money;
}


// Updating the zombies' positions every second
function start() {
    setInterval(updatePositions, 1000); // 1000 miliseconds = 1 sec
}
function updatePositions() {
    var position_str = "";
    myGameArea.clear();
    //    this.context.fillRect(150,30,30,30);
    
    for (var i=0; i < zombies.length; i++) {
        var pos_index = zombies[i].position_index;
        zombies[i].position_x = x_positions[pos_index+1];
        zombies[i].position_y = y_positions[pos_index+1];
        zombies[i].position_index++;
        myGameArea.moveWhere(zombies[i].position_x, zombies[i].position_y, zombies[i].type);
        position_str += " [" +zombies[i].position_x + ", " + zombies[i].position_y +"]";
    }
    document.getElementById("positions").innerHTML = "positions: " +position_str;
}
function addTower() {
    document.getElementById("towers").innerHTML = "accept input: ";
    // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
    var tower_x = document.getElementById("tower_x").value || 0;
    var tower_y = document.getElementById("tower_y").value || 0;
    
    
    document.getElementById("towers").innerHTML = "accept input x: [" +tower_x +", " +tower_y +"]";
    towers.push({
                type: "regular",
                health: 150,
                attack_speed: 3,
                position_x: tower_x,
                position_y: tower_y
    });
    var position_str = "";
    for (var i=0; i < towers.length; i++) {
        position_str += " [" +towers[i].position_x + ", " + towers[i].position_y +"]";
    }
    document.getElementById("towers").innerHTML = "num: "+towers.length +" towers: " +position_str;
}

var myGamePiece;
/*
var a_canvas = document.getElementById("canv");
var context = canvas.getContext('2d');
context.rect(100,100,300,300);
context.fillStyle = 'yellow';
context.fill();
 */
/*
 var a_canvas = document.getElementById("canv");
var context = a_canvas.getContext("2d");
context.fillStyle = "yellow";
context.beginPath();
context.arc(95, 85, 40, 0, 2*Math.PI);
context.closePath();
context.fill();
context.lineWidth = 2;
context.stroke();
context.fillStyle = "black";

context.font = "30px Garamond";
context.fillText("Hello, World!",15,175);
 */
/*
 document.getElementById("textbox_1").value='';
 document.getElementById("textbox_2").value='';
 if(document.getElementById("textbox_1").focused){
 document.getElementById("textbox_1").value=text_to_be_inserted;
 }
 function addtext() {
	var newtext = document.myform.inputtext.value;
	if (document.myform.placement[1].checked) {
        document.myform.outputtext.value = "";
    }
	document.myform.outputtext.value += newtext;
 }
 */
/*
var zombie1 = new Zombie("standard", 100, 5, 0); // creating an object
zombie1.damage(10); // calling the object function

for (var i=0; i < 10; i++) {
    zombies.push({
                 type: "standard",
                 health: 100,
                 speed: 5,
                 position: 0
    });
}
for (var counter=0; counter < zombies.length; counter++) {
    var array_index = 0;
    if (zombies[i].health <= 0) {
        zombies.splice(array_index, 1);
        continue;
    }
    array_index++;
}
// function expression example
var x = function (a, b) { return a * b; };
var z = x(4, 3);

*/
/*
 JavaScript function definitions do not specify data types for parameters.
 
 JavaScript functions do not perform type checking on the passed arguments.
 
 JavaScript functions do not check the number of arguments received.
 
 If a function is called with missing arguments (less than declared), the missing values are set to: undefined
 
 If a function is called with too many arguments (more than declared), these arguments can be reached using the arguments object.
 example: function findMax() --> findMax(4,5,6) --> access the arguments with arguments[i]
 
 */
/*
var add = (function () {
           javascript counter = 0;
           return function () {return counter+=1;};
           })();

add();
add();
add(); // counter is 3

 This add function above allows counter variable to be used only in add (vs making it global)
 while avoiding re-declaration of the variable whenever we call the function*/

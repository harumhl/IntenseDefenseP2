
//class Zombie {}

var money = 1000;
var zombies = [];
var towers = [];

// Object constructor function
function Zombie(type, health, speed, position) {
    this.type = type;
    this.health = health;
    this.speed = speed;
    this.position = position;
    this.damage = function (damages) {
        this.health -= damages;
    };
}
function addStandardZombie() {
    if (money < 100) {
        window.alert("Not Enough Money");
        return;
    }
    zombies.push({
                 type: "standard",
                 health: 100,
                 speed: 5,
                 position: 0
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
    zombies.push({
                 type: "strong",
                 health: 300,
                 speed: 2,
                 position: 0
                 });
    money -= 200;
    document.getElementById("demo").innerHTML = "Num Zombies: " + zombies.length +
        "\n" + "Money left: " + money;
}
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

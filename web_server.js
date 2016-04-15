var express = require('express');
var app = express();
app.use('/static', express.static('static'));
var path = require('path');

// viewed at http://localhost:8080
app.get('/', function(req, res) {
	console.log('sending file '+__dirname+'/withPhaser.html');
    res.sendFile(__dirname + '/static/withPhaser.html');
});



app.listen(13010, function(){
console.log(__dirname);
console.log('Example app listening on port 13010');

});

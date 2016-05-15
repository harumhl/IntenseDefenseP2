var express = require('express');
var app = express();
app.use('/static', express.static('static'));
var path = require('path');

// viewed at http://localhost:8080
app.get('/static/js', function(req, res) {
	console.log('sending file '+__dirname+'/withPhaser.html');
    res.sendFile(__dirname + '/static/withPhaser.html');
});



var portNum = 13011;
app.listen(portNum, function(){
console.log(__dirname);
console.log('Example app listening on port '+portNum);

});

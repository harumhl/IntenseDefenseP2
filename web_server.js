var express = require('express');
var app = express();
app.use('/static', express.static('static'));
var path = require('path');

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    console.log('sending file '+__dirname+'/static/index.html');
    res.sendFile(__dirname + '/static/index.html');
});

var portNum = 13011;
app.listen(portNum, function(){
    console.log('Example app listening on port '+portNum);
});

var express = require('express');
var app = express();

app.use('/static', express.static('static'));

// socket.io stuff goes here ...

app.get('/', function(req, res) {
  res.send('hello world');
});

app.listen(13000, function () {
  console.log('Example app listening on port 13000!');
});


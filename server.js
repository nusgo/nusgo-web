var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.set('port', (process.env.PORT) || 5000);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html')
});

http.listen(process.env.PORT || 5000, function() {
    console.log('NusGo Server is ready to serve on port ' + app.get('port') + "!");
});



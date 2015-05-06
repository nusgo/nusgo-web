// Application Setup
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname + '/public'));
app.set('port', (process.env.PORT) || 5000);

// Persistent Data
var markers = [];

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html')
});

app.get('/markers', function(req, res) {
    res.json(markers);
});

http.listen(process.env.PORT || 5000, function() {
    console.log('NusGo Server is ready to serve on port ' + app.get('port') + "!");
});


// socket.io functions

io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('disconnect', function() {
        console.log('a user disconnected');
    });
    socket.on('addmarker', function(marker) {
        console.log(marker);
        markers.push(marker);
        socket.broadcast.emit('addmarker', marker);
    });
    socket.on('removemarker', function(marker) {
        markers = markers.filter(function(o) {
            return !(o.lat == marker.lat &&
                     o.lng == marker.lng);
        });
        socket.broadcast.emit('removemarker', marker);
    })
});

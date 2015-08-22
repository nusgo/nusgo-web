// Application Setup
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var favicon = require('serve-favicon');
var pmx = require('pmx');
var db = require('./database/database.js')
// var pagedown = require('pagedown');
// var safeConverter = pagedown.getSanitizingConverter();

app.use(express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.set('port', (process.env.PORT) || 5000);

// MARK: Server Routes
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/placeholder.html')
});

app.get('/markers', function(req, res, next) {
    db.getActiveMarkers(function onRetrieveMarkers(error, markers) {
        if (error) return next(error);
        return res.json(markers);
    });
});

app.get('/rooms/:roomCode/messages', function(req, res, next) {
    var roomCode = req.params.roomCode;
    db.getMessagesInChatRoom(roomCode, function onRetrieveMessages(error, messages) {
        if (error) return next(error);
        res.json(messages);
    });
});

app.get('/rooms/:roomCode/users', function(req, res, next) {
    var roomCode = req.params.roomCode;
    db.getUsersInChatRoom(roomCode, function onRetrieveUsers(error, users) {
        if (error) return next(error);
        res.json(users);
    });
});

app.get('/rooms/:roomCode/going', function(req, res, next) {
    var roomCode = req.params.roomCode;
    db.getGoingList(roomCode, function onRetrieveUsers(error, users) {
        if (error) return next(error);
        res.json(users);
    })
});

app.get('/testdb', function(req, res, next) {
});


// Error handler for PM2/Keymetrics
app.use(pmx.expressErrorHandler());

http.listen(process.env.PORT || 5000, function() {
    console.log('NusGo Server is ready to serve on port ' + app.get('port') + "!");
});

// MARK: Socket.io Functions

io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('disconnect', function() {
        if (socket.user) {
            console.log('%s disconnected', socket.user.name);
        } else {
            console.log('anonymous user disconnected');
        }
    });
    socket.on('login', function(user) {
        socket.user = user;
        db.insertUser(user, function onInsertUser(error, users) { });
        db.getJoinedChatRooms(user, function onRetrieveChatRooms(error, roomCodes) {
            if (error) {
                console.log(error) ;
                return;
            }
            for(var i = 0; i < roomCodes.length; i++) {
                socket.join(roomCodes[i]);
            }
        });
    });
    socket.on('addmarker', function(marker) {
        // Sanitize and parse markdown
        // marker.message = safeConverter.makeHtml(marker.message);
        db.insertMarker(marker, function onInsertMarker(error, rows) {
            if (error) {
                console.log(error) ;
                return;
            }
            console.log(rows);
            var markerId = rows[0].id;
            socket.emit('markerid', markerId);
            marker.id = markerId;
            socket.broadcast.emit('addmarker', marker);
        });
    });
    socket.on('removemarker', function(marker) {
        socket.broadcast.emit('removemarker', marker);
        db.removeMarker(marker, function onRemoveMarker(error, markers) { });
    });
    socket.on('chatMessage', function(chatMessage){
        // Sanitize and parse markdown
        // chatMessage.content = safeConverter.makeHtml(chatMessage.content);
        var roomCode = chatMessage.roomCode;
        socket.to(roomCode).emit('chatMessage', chatMessage);
        db.insertMessage(chatMessage, function onInsertMessage(error, rows) { });
    });
    socket.on('joinroom', function(roomCode) {
        if (!(socket.user)) return;
        console.log("%s joins room %d", socket.user.name, roomCode);
        socket.join(roomCode);
        db.joinRoom(socket.user, roomCode, function onJoinRoom(error, row) { });
    });
    socket.on('going', function(roomCode) {
        if (!(socket.user)) return;
        console.log("%s is going! (Room %d)", socket.user.name, roomCode);
        db.joinEvent(socket.user, roomCode, function onJoinEvent(error, rows) { });
        socket.broadcast.emit('going', {
            markerID: roomCode,
            user: socket.user
        }); //for marker purpose
        socket.broadcast.emit('going-' + roomCode, socket.user); //for chat purpose
    })
});

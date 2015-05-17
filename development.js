// Application Setup
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname + '/public'));
app.set('port', (process.env.PORT) || 5000);

var users = [];
var markers = [];
var joinedRooms = { };
var messages = { };
var participants = { };
var goingList = { };

// MARK: Server Routes
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html')
});

app.get('/markers', function(req, res, next) {
    getActiveMarkers(function onRetrieveMarkers(error, markers) {
        if (error) return next(error);
        return res.json(markers);
    });
});

app.get('/rooms/:roomCode/messages', function(req, res, next) {
    var roomCode = req.params.roomCode;
    getMessagesInChatRoom(roomCode, function onRetrieveMessages(error, messages) {
        if (error) return next(error);
        res.json(messages);
    });
});

app.get('/rooms/:roomCode/users', function(req, res, next) {
    var roomCode = req.params.roomCode;
    getUsersInChatRoom(roomCode, function onRetrieveUsers(error, users) {
        if (error) return next(error);
        res.json(users);
    });
});

app.get('/rooms/:roomCode/going', function(req, res, next) {
    var roomCode = req.params.roomCode;
    getGoingList(roomCode, function onRetrieveUsers(error, users) {
        if (error) return next(error);
        res.json(users);
    })
});

app.get('/testdb', function(req, res, next) {
});

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
        console.log("%s [%s] logs in.", user.name, user.id);
        socket.user = user;
        insertUser(user, function onInsertUser(error, users) { });
        getJoinedChatRooms(user, function onRetrieveChatRooms(error, roomCodes) {
            for(var i = 0; i < roomCodes.length; i++) {
                socket.join(roomCodes[i]);
            }
        });
    });
    socket.on('addmarker', function(marker) {
        insertMarker(marker, function onInsertMarker(error, markerId) { 
            socket.emit('markerid', markerId);
            marker.id = markerId;
            socket.broadcast.emit('addmarker', marker);
        });
    });
    socket.on('removemarker', function(marker) {
        socket.broadcast.emit('removemarker', marker);
        removeMarker(marker, function onRemoveMarker(error, markers) { });
    });
    socket.on('chatMessage', function(chatMessage){
        var roomCode = chatMessage.roomCode;
        socket.to(roomCode).emit('chatMessage', chatMessage);
        insertMessage(chatMessage, function onInsertMessage(error, rows) { });
    });
    socket.on('joinroom', function(roomCode) {
        if (!(socket.user)) return;
        console.log("%s joins room %d", socket.user.name, roomCode);
        socket.join(roomCode);
        joinRoom(socket.user, roomCode, function onJoinRoom(error, row) { });
    });
    socket.on('going', function(roomCode) {
        if (!(socket.user)) return;
        console.log("%s is going! (Room %d)", socket.user.name, roomCode);
        joinEvent(socket.user, roomCode, function onJoinEvent(error, rows) { });
        io.emit('going-' + roomCode, socket.user);
    })
});


// MARK: QUERY FUNCTIONS

function getActiveMarkers(callback) {
    callback(null, markers);
}

function insertMarker(marker, callback) {
    marker.id = markers.length + 1;
    markers.push(marker);
    callback(null, marker.id);
}

function removeMarker(marker, callback) {
    markers = markers.filter(function(o) {
        return o.id != marker.id;
    });
}

function insertUser(user, callback) {
    users.push(user);
}

function joinRoom(user, roomCode, callback) {
    if (participants[roomCode] == null) {
        participants[roomCode] = [];
    }
    if (joinedRooms[user.id] == null) {
        joinedRooms[user.id] = [];
    }
    participants[roomCode].push(user);
    joinedRooms[user.id].push(roomCode);
}

function insertMessage(message, callback) {
    if (messages[message.roomCode] == null) {
        messages[message.roomCode] = [];
    }
    messages[message.roomCode].push(message);
}

function getUsersInChatRoom(roomCode, callback) {
    if (participants[roomCode] == null) {
        participants[roomCode] = [];
    }
    callback(null, participants[roomCode]);
}

function getMessagesInChatRoom(roomCode, callback) {
    if (messages[roomCode] == null) {
        messages[roomCode] = [];
    }
    callback(null, messages[roomCode]);
}

function getJoinedChatRooms(user, callback) {
    if (joinedRooms[user.id] == null) {
        joinedRooms[user.id] = [];
    }
    callback(null, joinedRooms[user.id]);
}

function joinEvent(user, roomCode, callback) {
    if (goingList[roomCode] == null) {
        goingList[roomCode] = [];
    }
    goingList[roomCode].push(user);
    callback(null, null);
}

function getGoingList(roomCode, callback) {
    if (goingList[roomCode] == null) {
        goingList[roomCode] = [];
    }
    callback(null, goingList[roomCode]);
}

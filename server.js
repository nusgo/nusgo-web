// Application Setup
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pg = require('pg');
var databaseUrl = process.env.DATABASE_URL;
app.use(express.static(__dirname + '/public'));
app.set('port', (process.env.PORT) || 5000);

// Persistent Data
var markers = [];
var users = [];
var joinedRooms = {};

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html')
});

app.get('/markers', function(req, res) {
    // getActiveMarkers(function onRetrieveMarkers(error, markers) {
    //     if (error) return next(error);
    //     return res.json(markers);
    // });
    res.json(markers);
});

app.get('/messages/:roomCode', function(req, res, next) {
    var roomCode = req.params.roomCode;
    getMessagesInChatRoom(roomCode, function onRetrieveMessages(error, messages) {
        if (error) return next(error);
        res.json(messages);
    });
});

app.get('/testdb', function(req, res, next) {
    insert
});

http.listen(process.env.PORT || 5000, function() {
    console.log('NusGo Server is ready to serve on port ' + app.get('port') + "!");
});

// socket.io functions

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
        console.log('%s has logged in.', socket.user.name)
        insertUser(user, function onInsertUser(error, users) { });
    });
    socket.on('addmarker', function(marker) {
        socket.broadcast.emit('addmarker', marker);
        insertMarker(marker, function onInsertMarker(error, rows) { 
            socket.emit('markerid', rows[0].id);
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
        joinRoom(socket.user, marker, function onJoinRoom(error, row) { });
    })
});


// MARK: QUERY STRING
var QUERY_ALL_MARKERS = 
    "select * from markers;";

var QUERY_ACTIVE_MARKERS = 
    "select m.id, m.lat, m.lng, m.meal_type, m.message, m.meal_time, m.user_id, u.name as user_name " +
    "from markers m " +
    "inner join users u " + 
    "on m.user_id = u.id " +
    "where meal_time + interval '1 hour' > now();"

var QUERY_INSERT_MARKER = 
    "insert into markers (lat, lng, meal_type, message, meal_time, user_id) " +
    "values ($1, $2, $3, $4, $5, $6) " +
    "returning id;";

var QUERY_REMOVE_MARKER = 
    "update markers set is_active = false " +
    "where user_id = $1 and lat = $2 and lng = $3;";

var QUERY_INSERT_USER = 
    "insert into users (id, name) " +
    "select $1, $2 " +
    "where not exists (select id from users where id = $1::varchar(128));";

var QUERY_JOIN_ROOM =
    "insert into users_markers " +
    "select $1 as user_id, $2 as marker_id " +
    "where not exists ( " +
    "   select * from users_markers " +
    "   where user_id = $1 and marker_id = $2 " +
    ");";

var QUERY_INSERT_MESSAGE = 
    "insert into messages (user_id, marker_id, content)" +
    "values ($1, $2, $3);";

var QUERY_PEEK_ROOM = 
    "select u.id, u.name " +
    "from users_markers um " +
    "inner join users u " +
    "   on u.id = um.user_id " +
    "where um.marker_id = $1;";

var QUERY_GET_MESSAGES = 
    "select u.id as from_id, u.name as from_name, msg.content, m.id as room_code, u2.name as marker_name " +
    "from messages msg " +
    "inner join users u " +
    "   on msg.user_id = u.id " +
    "inner join markers m " +
    "   on m.id = msg.marker_id " +
    "inner join users u2 " +
    "   on m.user_id = u2.id " +
    "where marker_id = $1 " +
    "order by msg.created_time;";

// MARK: QUERY FUNCTIONS
function getAllMarkers(callback) {
    return executeQuery(QUERY_ALL_MARKERS, [], rowToMarker, callback);
}

function getActiveMarkers(callback) {
    return executeQuery(QUERY_ACTIVE_MARKERS, [], rowToMarker, callback);
}

function insertMarker(marker, callback) {
    return executeQuery(QUERY_INSERT_MARKER, markerToRow(marker), identity, callback);
}

function removeMarker(marker, callback) {
    return executeQuery(
        QUERY_REMOVE_MARKER, 
        [marker.userId, marker.lat, marker.lng],
        identity,
        callback);
}

function insertUser(user, callback) {
    return executeQuery(
        QUERY_INSERT_USER,
        [user.id, user.name],
        identity,
        callback);
}

function joinRoom(user, roomCode, callback) {
    return executeQuery(
        QUERY_JOIN_ROOM,
        [user.id, roomCode],
        identity,
        callback);
}

function insertMessage(message, callback) {
    return executeQuery(
        QUERY_INSERT_MESSAGE,
        [message.fromId, message.roomCode, message.content],
        identity,
        callback);
}

function getUsersInChatRoom(roomCode, callback) {
    return executeQuery(
        QUERY_PEEK_ROOM,
        [roomCode],
        identity,
        callback);
}

function getMessagesInChatRoom(roomCode, callback) {
    return executeQuery(
        QUERY_GET_MESSAGES,
        [roomCode],
        rowToMessage,
        callback);
}

// MARK: ROW-TO-OBJECT TRANSFORM FUNCTIONS
function rowToMarker(row) {
    return {
        id: row.id,
        lat: row.lat,
        lng: row.lng,
        mealType: row.meal_type,
        message: row.message,
        mealTime: row.meal_time,
        userId: row.user_id,
        userName: row.user_name
    }
}

function markerToRow(marker) {
    return [
        marker.lat,
        marker.lng,
        marker.mealType,
        marker.message,
        marker.mealTime,
        marker.userId
    ];
}

function rowToMessage(row) {
    return {
        fromId: row.from_id,
        fromName: row.from_name,
        content: row.content,
        roomCode: row.room_code,
        markerName: row.marker_name
    };
}

function identity(row) {
    return row;
}

// MARK: LOW-LEVEL DB FUNCTIONS
function executeQuery(query, params, transform, callback) {
    pg.connect(databaseUrl, function onConnect(err, client, done) {
        if (err) return callback(err);
        client.query(query, params, function onFinishQuery(err, result) {
            if (err) return callback(err);
            callback(null, result.rows.map(transform));
            done();
        })
    });
}

// Application Setup
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pg = require('pg');
var databaseUrl = process.env.DATABASE_URL;
app.use(express.static(__dirname + '/public'));
app.set('port', (process.env.PORT) || 5000);

// MARK: Server Routes
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html')
});

app.get('/markers', function(req, res) {
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
        socket.user = user;
        insertUser(user, function onInsertUser(error, users) { });
        getJoinedChatRooms(user, function onRetrieveChatRooms(error, roomCodes) {
            for(var i = 0; i < roomCodes.length; i++) {
                socket.join(roomCodes[i]);
            }
        });
    });
    socket.on('addmarker', function(marker) {
        insertMarker(marker, function onInsertMarker(error, rows) { 
            var markerId = rows[0].id;
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
        console.log(chatMessage);
        var roomCode = chatMessage.roomCode;
        socket.to(roomCode).emit('chatMessage', chatMessage);
        insertMessage(chatMessage, function onInsertMessage(error, rows) { });
    });
    socket.on('joinroom', function(roomCode) {
        if (!(socket.user)) return;
        console.log("%s joins room %d", socket.user.name, roomCode);
        socket.join(roomCode);
        joinRoom(socket.user, roomCode, function onJoinRoom(error, row) { });
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
    "where id = $1";

var QUERY_INSERT_USER = 
    "insert into users (id, name) " +
    "select $1, $2 " +
    "where not exists (select id from users where id = $1::varchar(128));";

var QUERY_JOIN_ROOM =
    "insert into users_markers (user_id, marker_id) " +
    "select $1 as user_id, $2 as marker_id " +
    "where not exists ( " +
    "   select * from users_markers " +
    "   where user_id = $1::varchar(128) and marker_id = $2 " +
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
    "select u.id as from_id, u.name as from_name, msg.content, m.id as room_code, u2.name as marker_name, m.meal_type" +
    "from messages msg " +
    "inner join users u " +
    "   on msg.user_id = u.id " +
    "inner join markers m " +
    "   on m.id = msg.marker_id " +
    "inner join users u2 " +
    "   on m.user_id = u2.id " +
    "where marker_id = $1 " +
    "order by msg.created_time;";

var QUERY_GET_JOINED_CHAT_ROOMS =
    "select marker_id from users_markers where user_id = $1 " +
    "union " +
    "select id as marker_id from markers where user_id = $1;"

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
    console.log("Deactivating marker id %d", marker.id);
    return executeQuery(
        QUERY_REMOVE_MARKER, 
        [marker.id],
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
    console.log(user.id);
    console.log(roomCode);
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

function getJoinedChatRooms(user, callback) {
    return executeQuery(
        QUERY_GET_JOINED_CHAT_ROOMS,
        [user.id],
        rowToRoomCode,
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
        userID: row.user_id,
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
        marker.userID
    ];
}

function rowToMessage(row) {
    return {
        fromId: row.from_id,
        fromName: row.from_name,
        content: row.content,
        roomCode: row.room_code,
        markerName: row.marker_name,
        mealType: row.meal_type
    };
}

function rowToRoomCode(row) {
    return row.marker_id;
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

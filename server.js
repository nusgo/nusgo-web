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

app.get('/messages/:roomCode', function(req, res) {
    // return all messages in a room code
});

app.get('/testdb', function(req, res, next) {
    var dummyMarker = {
        lat: 2341.2345148,
        lng: 1.3128000,
        mealType: "Supper",
        message: "Testing insert from express",
        mealTime: new Date(),
        userId: 1
    };
    removeMarker(dummyMarker, function onRemoveMarker(error, markers) {
        if (error) return next(error);
        return res.json(markers);
    });
});

http.listen(process.env.PORT || 5000, function() {
    console.log('NusGo Server is ready to serve on port ' + app.get('port') + "!");
});

// socket.io functions

io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('disconnect', function() {
        console.log('%s disconnected', socket.user.name);
    });
    socket.on('login', function(user) {
        socket.user = user;
        console.log('%s has logged in.', socket.user.name)
    });
    socket.on('addmarker', function(marker) {
        socket.broadcast.emit('addmarker', marker);
        insertMarker(marker, function onInsertMarker(error, markers) { });
    });
    socket.on('removemarker', function(marker) {
        socket.broadcast.emit('removemarker', marker);
        removeMarker(marker, function onRemoveMarker(error, markers) { });
    });
    socket.on('chatMessage', function(chatMessage){
        var roomCode = chatMessage.roomCode;
        socket.to(roomCode).emit('chatMessage', chatMessage);
        // insert message to table
    });
    socket.on('joinroom', function(roomCode) {
        console.log("Joining room " + roomCode);
        socket.join(roomCode);
    })
});


// MARK: QUERY STRING
var QUERY_ALL_MARKERS = 
    "select * from markers;";
var QUERY_ACTIVE_MARKERS = 
    "select id, lat, lng, meal_type, message, meal_time, user_id " +
    "from markers " +
    "where meal_time + interval '1 hour' > now();"
var QUERY_INSERT_MARKER = 
    "insert into markers (lat, lng, meal_type, message, meal_time, user_id) " +
    "values ($1, $2, $3, $4, $5, $6);";
var QUERY_REMOVE_MARKER = 
    "update markers set is_active = false " +
    "where user_id = $1 and lat = $2 and lng = $3;";

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

function getUsersInChatRoom(roomCode, callback) {

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
        userId: row.user_id
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

var pg = require('pg');
var sqlQueries = require('./sql_queries.js');
var rowTransforms = require('./row_transforms.js');
var databaseUrl = process.env.DATABASE_URL;

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

// MARK: QUERY FUNCTIONS

exports.getActiveMarkers = function getActiveMarkers(callback) {
    return executeQuery(sqlQueries.QUERY_ACTIVE_MARKERS, [], rowTransforms.rowToMarker, callback);
}

exports.insertMarker = function insertMarker(marker, callback) {
    return executeQuery(sqlQueries.QUERY_INSERT_MARKER, rowTransforms.markerToRow(marker), rowTransforms.identity, callback);
}

exports.removeMarker = function removeMarker(marker, callback) {
    console.log("Deactivating marker with id %d", marker.id);
    return executeQuery(
        sqlQueries.QUERY_REMOVE_MARKER, 
        [marker.id],
        rowTransforms.identity,
        callback);
}

exports.insertUser = function insertUser(user, callback) {
    return executeQuery(
        sqlQueries.QUERY_INSERT_USER,
        [user.id, user.name],
        rowTransforms.identity,
        callback);
}

exports.joinRoom = function joinRoom(user, roomCode, callback) {
    return executeQuery(
        sqlQueries.QUERY_JOIN_ROOM,
        [user.id, roomCode],
        rowTransforms.identity,
        callback);
}

exports.insertMessage = function insertMessage(message, callback) {
    return executeQuery(
        sqlQueries.QUERY_INSERT_MESSAGE,
        [message.fromId, message.roomCode, message.content],
        rowTransforms.identity,
        callback);
}

exports.getUsersInChatRoom = function getUsersInChatRoom(roomCode, callback) {
    return executeQuery(
        sqlQueries.QUERY_PEEK_ROOM,
        [roomCode],
        rowTransforms.identity,
        callback);
}

exports.getMessagesInChatRoom = function getMessagesInChatRoom(roomCode, callback) {
    return executeQuery(
        sqlQueries.QUERY_GET_MESSAGES,
        [roomCode],
        rowTransforms.rowToMessage,
        callback);
}

exports.getJoinedChatRooms = function getJoinedChatRooms(user, callback) {
    return executeQuery(
        sqlQueries.QUERY_GET_JOINED_CHAT_ROOMS,
        [user.id],
        rowTransforms.rowToRoomCode,
        callback);
}

exports.joinEvent = function joinEvent(user, roomCode, callback) {
    return executeQuery(
        sqlQueries.QUERY_JOIN_EVENT,
        [user.id, roomCode],
        rowTransforms.identity,
        callback);
}

exports.getGoingList = function getGoingList(roomCode, callback) {
    return executeQuery(
        sqlQueries.QUERY_GET_GOING_LIST,
        [roomCode],
        rowTransforms.identity,
        callback);
}

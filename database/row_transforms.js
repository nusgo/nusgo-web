// MARK: ROW-TO-OBJECT TRANSFORM FUNCTIONS
exports.rowToMarker = function rowToMarker(row) {
    return {
        id: row.id,
        lat: row.lat,
        lng: row.lng,
        mealType: row.meal_type,
        message: row.message,
        mealTime: row.meal_time,
        userID: row.user_id,
        userName: row.user_name,
        goingUserIDs: row.going_user_ids
    }
}

exports.markerToRow = function markerToRow(marker) {
    return [
        marker.lat,
        marker.lng,
        marker.mealType,
        marker.message,
        marker.mealTime,
        marker.userID
    ];
}

exports.rowToMessage = function rowToMessage(row) {
    return {
        fromId: row.from_id,
        fromName: row.from_name,
        content: row.content,
        roomCode: row.room_code,
        markerName: row.marker_name,
        mealType: row.meal_type
    };
}

exports.rowToRoomCode = function rowToRoomCode(row) {
    return row.marker_id;
}

exports.identity = function identity(row) {
    return row;
}

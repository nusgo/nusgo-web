// MARK: QUERY STRING

exports.QUERY_ACTIVE_MARKERS = 
    "select m.id, m.lat, m.lng, m.meal_type, m.message, m.meal_time, " + 
    "m.user_id, u.name as user_name, " +
    "array_to_json(array(select user_id from goinglist where marker_id = m.id)) as going_user_ids " +
    "from markers m " +
    "inner join users u " + 
    "   on m.user_id = u.id " +
    "where meal_time + interval '1 hour' > now() " +
    "   and m.is_active = true;";


exports.QUERY_INSERT_MARKER = 
    "insert into markers (lat, lng, meal_type, message, meal_time, user_id) " +
    "values ($1, $2, $3, $4, $5, $6) " +
    "returning id;";

exports.QUERY_REMOVE_MARKER = 
    "update markers set is_active = false " +
    "where id = $1";

exports.QUERY_INSERT_USER = 
    "insert into users (id, name) " +
    "select $1, $2 " +
    "where not exists (select id from users where id = $1::varchar(128));";

exports.QUERY_JOIN_ROOM =
    "insert into chatrooms (user_id, marker_id) " +
    "select $1 as user_id, $2 as marker_id " +
    "where not exists ( " +
    "   select * from chatrooms " +
    "   where user_id = $1::varchar(128) and marker_id = $2 " +
    ");";

exports.QUERY_JOIN_EVENT =
    "insert into goinglist (user_id, marker_id) " +
    "select $1 as user_id, $2 as marker_id " +
    "where not exists ( " +
    "   select * from goinglist " +
    "   where user_id = $1::varchar(128) and marker_id = $2 " +
    ");";

exports.QUERY_INSERT_MESSAGE = 
    "insert into messages (user_id, marker_id, content)" +
    "values ($1, $2, $3);";

exports.QUERY_PEEK_ROOM = 
    "select u.id, u.name " +
    "from chatrooms cr " +
    "inner join users u " +
    "   on u.id = cr.user_id " +
    "where cr.marker_id = $1;";

exports.QUERY_GET_MESSAGES = 
    "select u.id as from_id, u.name as from_name, msg.content, m.id as room_code, u2.name as marker_name, m.meal_type " +
    "from messages msg " +
    "inner join users u " +
    "   on msg.user_id = u.id " +
    "inner join markers m " +
    "   on m.id = msg.marker_id " +
    "inner join users u2 " +
    "   on m.user_id = u2.id " +
    "where marker_id = $1 " +
    "order by msg.created_time;";

exports.QUERY_GET_JOINED_CHAT_ROOMS =
    "select marker_id from chatrooms where user_id = $1 " +
    "union " +
    "select id as marker_id from markers where user_id = $1;"

exports.QUERY_GET_GOING_LIST = 
    "select u.id, u.name " +
    "from goinglist g " +
    "inner join users u " +
    "   on g.user_id = u.id " +
    "where g.marker_id = $1 " +
    "union " +
    "select u.id, u.name " +
    "from markers m " +
    "inner join users u " +
    "   on m.user_id = u.id " +
    "where m.id = $1;";

exports.QUERY_GET_UNREAD_MESSAGES = 
    "begin; " +
    "select message_id from unread_messages where user_id = $1; " +
    "delete from unread_messages where user_id = $1; " +
    "commit;";

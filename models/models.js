var Sequelize = require('sequelize');

var sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://nusgo:nusgo@localhost:5432/nusgodb');

var User = sequelize.define('user', {
    name: { type: Sequelize.STRING },
    id: { type: Sequelize.STRING }
});

User
    .sync()
    .then(function onSyncFinished() {
        User.create({
            name: "booby",
            id: "0374013385"
        });
    });

exports.User = User;

var Marker = sequelize.define('marker', {
    lat: { type: Sequelize.FLOAT(12, 12) },
    lng: { type: Sequelize.FLOAT(12, 12) },
    mealType: { type: Sequelize.STRING(20) },
    message: { type: Sequelize.TEXT },
    owner: { type: Sequelize.STRING }

});

Marker.hasOne(User, { as: 'owner' });

Marker.hasMany(User, { as: 'participants' });



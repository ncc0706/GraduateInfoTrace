var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

var autoincrement = require('mongoose-auto-increment');
autoincrement.initialize(mongodb.mongoose.connection);

var UserSchema = new Schema({
    id: {
        type: 'Number',
        require: true
    },
    name: {
        type: 'String',
        require: true
    },
    passwd: {
        type: 'String',
        require: true
    },
    role: {
        type: 'String',
        require: true
    }
});


UserSchema.statics.findByID = function (id) {
    this.find({id: id});
}

var User = mongodb.mongoose.model("user", UserSchema);

UserSchema.plugin(autoincrement.plugin, {
    model: 'User',
    field: 'id',
    startAt: 2015000000,
    incrementBy: 1
})

module.exports = User;

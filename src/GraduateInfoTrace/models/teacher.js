var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

var User = require('./user.js');

var TeacherSchema = new Schema(
    {
        uid: {
            type: 'Number',
            require: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            require: true
        },
        email: String,
        phone: String,

        academy: {
            type: 'String',
            enum: ['机械与汽车工程学院', '电气与自动化工程学院', '计算机与信息学院',
                '管理学院', '数学学院', '外国语学院', '马克思主义学院']
        },
    }
);

var Teacher = mongodb.mongoose.model("teacher", TeacherSchema);

module.exports = Teacher;

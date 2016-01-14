var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;


var StudentSchema = new Schema(
    {
        // Personal profile
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

        // School information
        time: {
            type: 'Number',
            min: 2009,
            max: 2020
        },
        academy: {
            type: 'String',
            enum: ['机械与汽车工程学院', '电气与自动化工程学院', '计算机与信息学院',
                '管理学院', '数学学院', '外国语学院', '马克思主义学院']
        },

        // Company information
        company: String,
        province: {
            type:'String',
            enum: ['北京','江西','安徽','甘肃','青海','广西','贵州','重庆','福建','广东'
                ,'西藏','新疆','海南','宁夏','陕西','山西','湖北','湖南','四川','云南'
                ,'河北','河南','辽宁','山东','天津','江苏','上海','浙江','吉林','内蒙古'
                ,'黑龙江','香港','澳门','台湾']
        }

    }
);

var Student = mongodb.mongoose.model("student", StudentSchema);

module.exports = Student;

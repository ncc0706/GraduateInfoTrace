var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/graduateInfo');

exports.mongoose = mongoose;

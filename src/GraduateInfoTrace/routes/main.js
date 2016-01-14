var express = require('express');
var logger = require('../logger').logger;
var router = express.Router();

router.get('/', function (req, res, next) {

    var id = req.user.id;
    var name = req.user.name;
    var role = req.user.role;

    var title = role;
    if (role === 'admin')
        role = '管理员';
    else if (role == 'student')
        role = '同学';
    else if (role == 'teacher')
        role = '老师';
    logger.info("The " + title + " with the id " + id + " named " + name + " !");
    res.render(title, {title: title, name: name, role: role});
});

module.exports = router;

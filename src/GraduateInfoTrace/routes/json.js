var express = require('express');
var multiparty = require('multiparty');
var path = require('path');
var fs = require('fs');
var router = express.Router();

var logger = require('../logger').logger;
var mycrypto = require('.././mycrypto');
var Student = require('./../models/student.js');
var User = require('./../models/user.js');
var Teacher = require('./../models/teacher.js');

// to get the users only used by the admin
router.get('/users', function (req, res, next) {
    if (req.user.role === 'admin') {
        User.find(function (err, docs) {
            if (err)
                logger.error(err);
            else {
                var srcs = [];
                for (var i = 0; i < docs.length; i++) {
                    var role = mycrypto.decipheraes(docs[i].role, docs[i].name);
                    var doc = {id: docs[i].id, name: docs[i].name, role: role};
                    srcs.push(doc);
                }
                res.json(srcs);
            }
        });
    }
});

// to new the user only used by the admin
router.post('/user', function (req, res) {
    if (req.user.role === 'admin') {
        var password = mycrypto.hashsha1(req.body.name);
        var role = mycrypto.cipheraes(req.body.role, req.body.name);
        // to new the user
        if (req.body.role === 'student') {
            User.create({name: req.body.name, passwd: password, role: role}, function (err, udoc) {
                if (err)
                    logger.error(err);
                else {
                    Student.create({uid: udoc.id, user: udoc._id}, function (err, sdoc) {
                        if (err)
                            logger.error(err);
                        else {
                            logger.info('create the student ' + udoc.id);
                            res.json({code : 0, id: udoc.id});
                        }
                    });
                }
            });

            //var udoc = new User({name: req.body.name, passwd: password, role: role});
            //udoc.save(function (err) {
            //    if (err)
            //        logger.error(err);
            //    else {
            //        var sdoc = new Student({uid: udoc.id, user: udoc._id});
            //        sdoc.save(function (err) {
            //            if (err)
            //                logger.error(err);
            //            else {
            //                res.json({code: 0, id: udoc.id});
            //            }
            //        });
            //    }
            //});

        } else if (req.body.role == 'teacher') {
            User.create({name: req.body.name, passwd: password, role: role}, function (err, udoc) {
                if (err)
                    logger.error(err);
                else {
                    Teacher.create({uid: udoc.id, user: udoc._id}, function (err, tdoc) {
                        if (err)
                            logger.error(err);
                        else {
                            logger.info('create the teacher ' + udoc.id);
                            res.json({code: 0, id: udoc.id});
                        }
                    });
                }
            });
        }
    }
});

// to update the user can be used by all the users
router.put('/user', function (req, res, next) {
    // if the role is admin
    if (req.user.role === 'admin') {
        var password = mycrypto.hashsha1(req.body.name);
        // to reset the password
        if (req.body.passwd === '') {
            User.update({id: req.body.id}, {$set: {passwd: password}}, function (err) {
                if (err) {
                    logger.error('reset the password of the ' + req.body.id + ' wrong !');
                    logger.error(err);
                    res.json({code: 0});
                }
                else {
                    logger.info('reset the password of ' + req.body.id + ' user successfully !');
                    res.json({code: 1});
                }
            });
        }
    } else {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields) {
            if (req.session.veri === fields.veri[0].toLowerCase()) {
                console.log('The verify code is ok !');
                // the right verify code
                User.findOne({id: req.user.id}, function (err, udoc) {
                    if (err) {
                        res.json({code: 2});
                        logger.error(err);
                    } else {
                        // the right old password
                        var old = mycrypto.hashsha1(fields.oldpwd[0]);
                        if (old === udoc.passwd) {
                            logger.info('The old password is ok !');
                            // the new password
                            var newone = mycrypto.hashsha1(fields.newpwd[0]);
                            User.update({id: req.user.id}, {$set: {passwd: newone}}, function (err) {
                                if (err) {
                                    res.json({code: 2});
                                    logger.error(err);
                                }
                                else {
                                    logger.info('The password is set !');
                                    res.json({code: 1});
                                }
                            });
                        } else {
                            logger.info('The old password is wrong !');
                            res.json({code: 3});
                        }
                    }
                });
            } else {
                logger.info('The wrong code !');
                res.json({code: 4});
            }
        });
    }
});

// to get the students only used by the teachers
router.get('/stuts', function (req, res, next) {
    // if it is the teacher
    if (req.user.role === 'teacher') {
        Teacher.findOne({uid: req.user.id}, function (err, tdoc) {
            if (err)
                logger.error(err);
            else {
                // To get the students with the specified academy
                if (tdoc.academy) {
                    Student.find({academy: tdoc.academy}).populate('user').exec(function (err, docs) {
                        var srcs = [];
                        for (var i = 0; i < docs.length; i++) {
                            var doc = docs[i];
                            var temp = {
                                id: doc.user.id,
                                name: doc.user.name,
                                time: doc.time,
                                company: doc.company,
                                academy: doc.academy,
                                province: doc.province
                            };
                            srcs.push(temp);
                        }
                        res.json(srcs);
                    });
                } else {
                    logger.info('Warn, please set your own profile !');
                    res.json([]);
                }
            }
        });
    }
});

// to get the information of the specified user can be used by all the users
router.get('/infos', function (req, res, next) {
    if (req.user.role === 'student') {
        // The student information
        Student.findOne({uid: req.user.id}).populate('user').exec(function (err, doc) {
            if (err) {
                logger.error(err)
            } else {
                var stu = {
                    id: doc.user.id,
                    name: doc.user.name,
                    email: doc.email,
                    phone: doc.phone,
                    time: doc.time,
                    academy: doc.academy,
                    company: doc.company,
                    province: doc.province
                };
                res.json(stu);
            }
        });
    } else if (req.user.role === 'teacher') {
        // The teacher information
        Teacher.findOne({uid: req.user.id}).populate('user').exec(function (err, doc) {
            if (err) {
                logger.error(err);
            } else {
                var teach = {
                    id: doc.user.id,
                    name: doc.user.name,
                    academy: doc.academy,
                    email: doc.email,
                    phone: doc.phone
                };
                res.json(teach);
            }
        });
    } else if (req.user.role === 'admin') {
        var data = fs.readFileSync(path.join(__dirname, '../admin.json'));
        var adminJson = {id: JSON.parse(data).id, name: JSON.parse(data).name};
        res.json(adminJson);
    }
});

// to update the information of the users, can be used by all the users
router.put('/infos', function (req, res, next) {
    if (req.user.role === 'student') {
        // To update the student information
        Student.update({uid: req.body.id},
            {
                $set: {
                    email: req.body.email,
                    phone: req.body.phone,
                    time: req.body.time,
                    academy: req.body.academy,
                    company: req.body.company,
                    province: req.body.province
                }
            },
            function (err) {
                if (err) {
                    logger.error(err);
                    res.json({code: 0});
                }
                else {
                    res.json({code: 1});
                    logger.info('Save the information of ' + req.body.id + ' user!');
                }
            });
    } else if (req.user.role === 'teacher') {
        // To update the teacher information
        Teacher.update({uid: req.body.id},
            {
                $set: {
                    academy: req.body.academy,
                    email: req.body.email,
                    phone: req.body.phone
                }
            },
            function (err) {
                if (err) {
                    logger.error(err);
                    res.json({code: 0});
                }
                else {
                    res.json({code: 1});
                    logger.info('Save the information of ' + req.body.id + ' teacher !');
                }
            })
    }
});

module.exports = router;

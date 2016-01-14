var express = require('express');
var multiparty = require('multiparty');
var gm = require('gm');
var fs = require('fs');
var path = require('path');
var mycrypto = require('.././mycrypto');

var logger = require('../logger').logger;

var router = express.Router();

router.post('/pre', function (req, res, next) {

    var form = new multiparty.Form({uploadDir: path.join(__dirname, '../public/tmps')});

    form.parse(req, function (err, fields, files) {

        //var filesTmp = JSON.stringify(files, null, 2);

        if (err) {
            logger.error(err);
        } else {
            // to upload the avatar
            var uploadPath = files.file[0].path;
            // the move the avatar
            var imageMagick = gm.subClass({imageMagic: true});
            var originImg = imageMagick(uploadPath);

            var dstname = mycrypto.hashmd5(req.user.id);

            originImg.resize(125, 125, '!')
                .autoOrient()
                .write(path.join(__dirname, '../public/tmps', dstname), function (err) {
                    if (err)
                        logger.error(err);
                    else {
                        res.json({code: 1});
                        fs.unlink(uploadPath);
                    }
                });
        }
    });

});

router.post('/save', function (req, res, next) {

    var dstname = mycrypto.hashmd5(req.user.id);

    var srcPic = path.join(__dirname, '../public/tmps', dstname);
    var dstPic = path.join(__dirname, '../public/pics', dstname);

    fs.exists(srcPic, function (exists) {
        if (exists) {
            fs.rename(srcPic, dstPic, function (err) {
                if (err)
                    res.json({code: '0'});
                else
                    res.json({code: '1'});
            });
        } else {
            res.json({code: '-1'});
        }
    })
});

router.get('/pre/:tmp', function (req, res, next) {

    var dstname = mycrypto.hashmd5(req.user.id);

    res.sendFile(path.join(__dirname, '../public/tmps', dstname));
});

router.get('/:tmp', function (req, res, next) {

    var dstname = mycrypto.hashmd5(req.user.id);

    var filePath = path.join(__dirname, '../public/pics', dstname);
    fs.exists(filePath, function (exists) {
        res.sendFile(exists ? filePath : path.join(__dirname, '../public/pics', 'default'));
    });
});

module.exports = router;
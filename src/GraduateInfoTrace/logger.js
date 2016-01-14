var log4js = require('log4js');
var path = require('path');

// the logger
log4js.configure({
    appenders: [
        {
            type: 'console'
        },
        {
            type: 'file',
            filename: path.join(__dirname, '/logs/access'),
            maxLogSize: 1024 * 1024,
            backups: 3,
            pattern:'-yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            category: 'normal'
        }
    ],
    replaceConsole: true,
    levels: {
        normal: 'INFO'
    }
});

var normal = log4js.getLogger('normal');

exports.logger = normal;

exports.use = function (app) {
    app.use(log4js.connectLogger(normal, {level: 'auto'}));
}
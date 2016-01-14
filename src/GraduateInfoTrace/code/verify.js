var ccap = require('ccap');

exports.captcha = function(){
	return ccap({
		width:100,
		height:35,
		offset:25,
		quality:100,
		fontsize:25,
		generate:function(){
			var chars = "abcdefghijklmnopqrstuvwxyz";
			var code = '';
			for (var i = 0; i < 4; i++)
				code += chars.substr(parseInt(Math.random()*26),1);
			return code;
		}
	}).get();
};

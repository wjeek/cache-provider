var BaseMiddleware = require('./BaseMiddleware');

var toString = Object.prototype.toString;

function ResponseTime(option){
	BaseMiddleware.apply(this, arguments);
	this._option = Object.assign({getResTime: true}, option);
	this._timeOption = {};
}

ResponseTime.prototype = Object.create(BaseMiddleware.prototype);
ResponseTime.prototype.constructor = ResponseTime;

ResponseTime.prototype.beforeget = function(query, next){
	if(this._option.getResTime){
		var keys = transformKey(query);
		this._timeOption.beforeGetTime = +new Date();
		console.log( 'Get ' + keys + ' 前时间：' + new Date());
	}
	next && next();
};

ResponseTime.prototype.afterget = function(query, next){
	if(this._option.getResTime){
		var keys = transformKey(query);
		var names = transformExtraName(query);
		this._timeOption.afterGetTime = +new Date();
		console.log('从 ' + names + ' Get ' + keys +' 后时间：' + new Date());
		console.log('从 ' + names + ' Get ' + keys + ' 的总时间：'+ (this._timeOption.afterGetTime - this._timeOption.beforeGetTime) + '毫秒');
	}
	next && next();
};

ResponseTime.prototype.beforeset = function(query, next){
	if(this._option.setResTime){
		var keys = transformKey(query);
		this._timeOption.beforeSetTime = +new Date();
		console.log('Set '+ keys + ' 前时间：' + new Date());
	}
	next && next();
};

ResponseTime.prototype.afterset = function(query, next){
	if(this._option.setResTime){
		var keys = transformKey(query);
		var names = transformExtraName(query);
		this._timeOption.afterSetTime = +new Date();
		console.log('Set '+ keys + ' 后时间：' + new Date());
		console.log('从 ' + names + ' Set ' + keys + ' 的总时间'+ (this._timeOption.afterSetTime - this._timeOption.beforeSetTime) + '毫秒');
	}
	next && next();
};

function transformKey (query) {
	var keys = '';
	if (toString.call(query) == '[object Object]') {
		keys = query.key;
	} else if(toString.call(query) == '[object Array]'){
		keys = (query.map(function(v, i){
			return v.key;
		})).join(',');
	}
	return keys;
}

function transformExtraName(query){
	var names = '无名氏';
	if (toString.call(query) == '[object Object]') {
		names = query.extra && query.extra.name || names;
	} else if(toString.call(query) == '[object Array]'){
		names = (query.map(function(v, i){
			return (v.extra && v.extra.name || names);
		})).join(',');
	}
	return names;
}

module.exports = ResponseTime;
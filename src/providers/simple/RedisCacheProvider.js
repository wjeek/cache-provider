var redis = require('redis');
var Immutable = require('immutable');
var BaseProvider = require('../BaseProvider');
var redisConfig = require('../../../demo/config/redisConfig');
var CacheData = require('../../structs/CacheData');

var toString = Object.prototype.toString;


function RedisCacheProvider(options) {
	BaseProvider.apply(this, [{
		name: this._name,
		maxLength: this._maxLength
	}]);
	if (!options) {
		options = {
			name: 'RedisCacheProvider'
		}
	}
	this._name = options.name || 'RedisCacheProvider';
	this._maxLength = options.length || Math.pow(2, 31);

	/**
	 * redis 默认参数
	 * @type {{port: number, host: string, retry_strategy: redisOptions.retry_strategy}}
	 *      .port            端口号
	 *      .host            服务器IP
	 *      .retry_strategy  连接异常处理设置,每2秒重新连接一次
	 */
	redisOptions = {
		port: options.port || 6379,
		host: options.host || '127.0.0.1',
		retry_strategy: function (options) {
			if (options.error && options.error.code && options.error.code === 'ECONNREFUSED') {
				console.log('连接被拒绝');
			}
			if (options.attempt > 10) {
				console.log('重试连接超过' + options.attempt + '次');
			}
			if (options.total_retry_time > 1000 * 60) {
				console.log('重连时间超过1分钟')
			}
			return Math.min(options.attempt * 100, options.reTime || 2000);
		}
	};

	// 链接redis服务器
	this.__client = redis.createClient(redisOptions);
	this.__client.on('error', function (err) {
		console.log('Redis on error :' + err);
	});
}

RedisCacheProvider.prototype = Object.create(BaseProvider.prototype);
RedisCacheProvider.prototype.constructor = RedisCacheProvider;

/**
 * get redis cache value
 * @param cacheDataArr [Array]
 *                      .{Object}
 *                          .key        {String}         缓存数据的key
 *                          .value      {String/Object}  缓存数据的value
 *                          .meta       {Object}         缓存数据的其它信息
 *                          .extra      {Object}         额外信息
 *                              .name   { String}        标识取出源
 * @param callback {Function}
 */
RedisCacheProvider.prototype._getValues = function (cacheDataArr, callback) {
	var keys = transformKey(cacheDataArr), self = this;
	if (keys) {
		self.__getValue(keys, function (err, data) {
			var result = transformGetResult(data, cacheDataArr);
			callback && callback(err, result);
		});
	} else {
		callback && callback(new Error('RedisCache: transitive get key is err or undefined'), {
			success: [], failed: []
		})
	}
};

/**
 * set redis cache value
 * @param cacheDataArr [Array]
 *                      .{Object}
 *                          .key        {String}         缓存数据的key
 *                          .value      {String/Object}  缓存数据的value
 *                          .meta       {Object}         缓存数据的其它信息
 *                          .extra      {Object}         额外信息
 *                              .name   { String}        标识取出源
 * @param callback {Function}
 */
RedisCacheProvider.prototype._setValues = function (cacheDataArr, callback) {
	var cacheDataArrCopy = transformData(cacheDataArr), self = this;
	if (cacheDataArrCopy) {
		self.__setValue(cacheDataArrCopy, function (err, data) {
			var result = transformSetResult(data, cacheDataArr);
			callback && callback(err, result);
		});
	} else {
		callback && callback(new Error('RedisCache: transitive set key is err or undefined'), {
			success: [], failed: []
		})
	}
};

/**
 * delete redis cache value
 * @param cacheDataArr [Array]
 *                      .{Object}
 *                          .key        {String}         缓存数据的key
 *                          .value      {String/Object}  缓存数据的value
 *                          .meta       {Object}         缓存数据的其它信息
 *                          .extra      {Object}         额外信息
 *                              .name   { String}        标识取出源
 * @param callback {Function}
 */
RedisCacheProvider.prototype._deleteValues = function (cacheDataArr, callback) {
	var keys = transformKey(cacheDataArr), self = this;
	if (keys) {
		self.__deleteValue(keys, function (err, data) {
			var result = transformDeleteResult(err, data, cacheDataArr);
			callback && callback(err, result);
		});
	} else {
		callback && callback(new Error('RedisCache: transitive delete key is err or undefined'), {
			success: [], failed: []
		})
	}
};

/**
 * delete all redis cache
 * @param callback {Function}
 */
RedisCacheProvider.prototype._clearValues = function (callback) {
	var self = this;
	self.__client.keys("only_node_*", function(err, keys) {
		if(!err){
			self.__deleteValue(keys, function (error, data) {
				callback && callback(error, data);
			});
		}
	});
};

/**
 * 得到队列
 * @param cacheDataArr [Array]
 *                      .{Object}
 *                          .key        {String}         缓存数据的key
 *                          .value      {String/Object}  缓存数据的value
 *                          .meta       {Object}         缓存数据的其它信息
 *                          .extra      {Object}         额外信息
 *                              .name   { String}        标识取出源
 * @param callback {Function}
 */
RedisCacheProvider.prototype._load = function (cacheDataArr, callback) {
	var keys = transformKey(cacheDataArr), self = this;
	if (keys) {
		self.__getValue(keys, function (err, data) {
			var result = transformGetResult(data, cacheDataArr);
			callback && callback(err, result);
		});
	} else {
		callback && callback(new Error('RedisCache: transitive load key is err or undefined'), {
			success: [], failed: []
		})
	}
};

/**
 * 存储队列
 * @param cacheDataArr [Array]
 *                      .{Object}
 *                          .key        {String}         缓存数据的key
 *                          .value      {String/Object}  缓存数据的value
 *                          .meta       {Object}         缓存数据的其它信息
 *                          .extra      {Object}         额外信息
 *                              .name   { String}        标识取出源
 * @param callback {Function}
 * @private
 */
RedisCacheProvider.prototype._save = function (cacheDataArr, callback) {
	var cacheDataArrCopy = transformData(cacheDataArr), self = this;
	if (cacheDataArrCopy) {
		self.__setValue(cacheDataArrCopy, function (err, data) {
			var result = transformSetResult(data, cacheDataArr);
			callback && callback(err, result);
		});
	} else {
		callback && callback(new Error('RedisCache: transitive save key is err or undefined'), {
			success: [], failed: []
		})
	}
};

/**
 * 设置过期时间
 * @param cacheDataArr [Array]
 *                      .{Object}
 *                          .key        {String}         缓存数据的key
 *                          .value      {String/Object}  缓存数据的value
 *                          .meta       {Object}         缓存数据的其它信息
 *                          .extra      {Object}         额外信息
 *                              .name   { String}        标识取出源
 * @param callback {Function}
 * @private
 */
RedisCacheProvider.prototype._setExpirationTime = function (cacheDataArr, callback) {
	var key = transformKey(cacheData.key), self = this;
	if (key) {
		self.__setExpirationTime(key, parseInt(cacheData.meta.time || 0, 10), function (err, data) {
			callback && callback(err, new CacheData(cacheData.key, cacheData.meta, cacheData.value));
		});
	} else {
		callback && callback(new Error('RedisCache: transitive setExpirationTime key is err or undefined'))
	}
};

/**
 * 单个数据获取
 * @param keys {Array}
 * @param callback {Function}
 * @private
 */
RedisCacheProvider.prototype.__getValue = function (keys, callback) {
	var error, self = this;
	self.__client.mget(keys, function (err, data) {
		if (!err && data) {
			error = null;
		} else {
			error = new Error(err || 'RedisCache: get data is null');
		}
		callback && callback(error, data);
	});
};

/**
 * 单个数据存储
 * @param cacheDataArrCopy {Array}
 * @param callback {Function}
 * @private
 */
RedisCacheProvider.prototype.__setValue = function (cacheDataArrCopy, callback) {
	var error, self = this;
	var setList = [];
	cacheDataArrCopy.forEach(function (v, i) {
		setList.push(["set", v.key, v.value]);
	});
	self.__client.multi(setList).exec(function (err, replies) {
		if (!err) {
			error = null;
		} else {
			error = new Error(err || 'RedisCache: set data system error');
		}
		callback && callback(error, replies);
	});
};

/**
 * 数据删除
 * @param key {string} / {array}
 *              string 删除单个数据
 *              array 批量删除数据
 * @param callback {Function}
 * @private
 */
RedisCacheProvider.prototype.__deleteValue = function (key, callback) {
	var error, self = this;
	self.__client.del(key, function (err, data) {
		if (!err) {
			error = null;
			callback && callback(err, data);
		} else {
			error = err || 'RedisCache: del data system error';
			callback && callback(err, data);
		}
	});
};

/**
 * 设置过期时间
 * @param key {string}
 * @param callback {Function}
 * @private
 */
RedisCacheProvider.prototype.__setExpirationTime = function (key, expireTime, callback) {
	var error, self = this;
	self.__client.expire(key, parseInt(expireTime || 0, 10), function (err, data) {
		if (!err) {
			error = null;
		} else {
			error = err || 'RedisCache: setExpirationTime system error';
		}
		callback && callback(err, data);
	});
};

/**
 * 对 普遍key 做判断处理
 * @param cacheDataArr
 * @returns {*}
 *          'only_node_' + string keys or false
 */
function transformKey(cacheDataArr) {
	if (cacheDataArr) {
		var keyCopy = [];
		if (toString.call(cacheDataArr) == "[object Object]") {
			keyCopy.push(cacheDataArr);
		} else if (toString.call(cacheDataArr) == "[object Array]") {
			keyCopy = cacheDataArr;
		}
		keyCopy = keyCopy.map(function (v) {
			if (toString.call(v.key) == "[object String]") {
				return 'only_node_' + v.key;
			} else {
				return 'only_node_' + JSON.stringify(v.key);
			}
		});
		return keyCopy;
	} else {
		return false;
	}
}

function transformData(data) {
	//data = JSON.parse(JSON.stringify(data));
	data = Immutable.fromJS(data).toJS();
	var dataArr = [];
	if (toString.call(data) == "[object Array]") {
		dataArr = data;
	} else if (toString.call(data) == "[object Object]") {
		dataArr.push(data);
	}
	dataArr.forEach(function (v, i) {
		if (toString.call(v.value) != "[object String]") {
			v.value = JSON.stringify(v.value);
		}
		if (toString.call(v.key) == "[object String]") {
			v.key = 'only_node_' + v.key;
		} else {
			v.key = 'only_node_' + JSON.stringify(v.key);
		}
	});
	return dataArr;
}

function transformDeleteResult(err, data, cacheDataArr) {
	var result = {
		success: [],
		failed: []
	};
	if (err) {
		result.failed = cacheDataArr;
	} else {
		result.success = cacheDataArr;
	}
	return result;
}

/**
 * 获取value字符串化
 * @param value
 * @param keys
 * @returns {string|*}
 */
function transformGetResult(data, cacheDataArr) {
	var result = {
		success: [],
		failed: []
	};
	(data || []).forEach(function (v, i) {
		var valueCopy;
		if (v) {
			try {
				valueCopy = JSON.parse(v);
			} catch (err) {
				valueCopy = v;
			}
			if (valueCopy.data && valueCopy.type == 'Buffer') {
				valueCopy = new Buffer(valueCopy.data);
			}
			result.success.push(CacheData(cacheDataArr[i].key||'', cacheDataArr[i].meta||'', valueCopy, cacheDataArr[i].extra && (cacheDataArr[i].extra.name='RedisCacheProvider') && cacheDataArr[i].extra));
		} else {
			result.failed.push(CacheData(cacheDataArr[i].key||'', cacheDataArr[i].meta||'', '', cacheDataArr[i].extra && (cacheDataArr[i].extra.name='RedisCacheProvider') && cacheDataArr[i].extra));
		}
	});
	return result;
}

function transformSetResult(data, cacheDataArr) {
	var result = {
		success: [],
		failed: []
	};
	(data || []).forEach(function (v, i) {
		if (v == 'OK') {
			result.success.push(cacheDataArr[i]);
		} else {
			result.failed.push(cacheDataArr[i]);
		}
	});
	return result;
}

exports = module.exports = RedisCacheProvider;

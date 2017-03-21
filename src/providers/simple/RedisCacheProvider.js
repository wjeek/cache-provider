var BaseProvider = require('../BaseProvider');
var redis = require('redis');
var redisConfig = require('../../../demo/config/redisConfig');
var CacheData = require('../../structs/CacheData');

/**
 * redis 默认参数
 * @type {{port: number, host: string, retry_strategy: redisDefaultOptions.retry_strategy}}
 *      .port 端口号
 *      .host 服务器IP
 *      .retry_strategy 连接异常处理设置
 *          每2秒重新连接一次
 */
var redisDefaultOptions = {
	port: 6379,
	host: '127.0.0.1',
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
		return Math.min(options.attempt * 100, 2000);
	}
};

/**
 * redis 自定义配置参数
 * @type {{}}
 */
var redisOptions = {};

// 环境判断
var envMap = {
	development: '-development',
	test: '-test',
	staging: '-staging',
	production: ''
};

var suffix = envMap[process.env.NODE_ENV];
suffix = suffix === undefined ? '-development' : suffix;

// 不同环境 选取不同redis参数
switch (suffix) {
	case '-development':
		redisOptions = Object.assign(redisDefaultOptions, redisConfig.redisDevelopment);
		break;
	case '-test':
		redisOptions = Object.assign(redisDefaultOptions, redisConfig.redisTest);
		break;
	case '-staging':
		redisOptions = Object.assign(redisDefaultOptions, redisConfig.redisStaging);
		break;
	case '':
		redisOptions = Object.assign(redisDefaultOptions, redisConfig.redisProduction);
		break;
	default:
		redisOptions = Object.assign(redisDefaultOptions, redisConfig.redisDevelopment);
}

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
	this.__client = redis.createClient(redisOptions);
	this.__client.on('error', function(err){
		console.log('Redis onerror :' + err);
	})
}

RedisCacheProvider.prototype = Object.create(BaseProvider.prototype);
RedisCacheProvider.prototype.constructor = RedisCacheProvider;

/**
 * get redis cache value
 * @param cacheData {object}
 * @param callback {Function}
 */
RedisCacheProvider.prototype._getValue = function (cacheData, callback) {
	var key = transformKey(cacheData.key), self = this;
	if (key) {
		self.__getValue(key, function (err, data) {
			callback && callback(err, new CacheData(cacheData.key, cacheData.meta, data.value));
		});
	} else {
		callback && callback(new Error('RedisCache: transitive get key is err or undefined'))
	}
};

/**
 * set redis cache value
 * @param cacheData {object}
 * @param callback {Function}
 */
RedisCacheProvider.prototype._setValue = function (cacheData, callback) {
	var key = transformKey(cacheData.key), self = this;
	if (key) {
		self.__setValue(key, cacheData, function (err, data) {
			callback && callback(err, new CacheData(cacheData.key, cacheData.meta, cacheData.value));
		});
	} else {
		callback && callback(new Error('RedisCache: transitive set key is err or undefined'))
	}
};

/**
 * delete redis cache value
 * @param cacheData {object}
 * @param callback {Function}
 */
RedisCacheProvider.prototype._deleteValue = function (cacheData, callback) {
	var key = transformArrayKey(cacheData.key), self = this;
	if (key) {
		self.__deleteValue(key, function (err, data) {
			callback && callback(err, new CacheData(cacheData.key, cacheData.meta, cacheData.value));
		});
	} else {
		callback && callback(new Error('RedisCache: transitive delete key is err or undefined'))
	}
};

/**
 * 得到队列
 * @param cacheData {object}
 * @param callback {Function}
 */
RedisCacheProvider.prototype._load = function (cacheData, callback) {
	var key = transformKey(cacheData.key), self = this;
	if (key) {
		self.__getValue(key, function (err, data) {
			callback && callback(err, new CacheData(cacheData.key, cacheData.meta, data.value));
		});
	} else {
		callback && callback(new Error('RedisCache: transitive load key is err or undefined'));
	}
};

/**
 * 存储队列
 * @param cacheData {object}
 * @param callback {Function}
 * @private
 */
RedisCacheProvider.prototype._save = function (cacheData, callback) {
	var key = transformKey(cacheData.key), self = this;
	if (key) {
		self.__setValue(key, cacheData, function (err, data) {
			callback && callback(err, new CacheData(cacheData.key, cacheData.meta, cacheData.value));
		});
	} else {
		callback && callback(new Error('RedisCache: transitive save key is err or undefined'));
	}
};

/**
 * 设置过期时间
 * @param cacheData {object}
 * @param callback {Function}
 * @private
 */
RedisCacheProvider.prototype._setExpirationTime = function (cacheData, callback) {
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
 * @param key {string}
 * @param callback {Function}
 * @private
 */
RedisCacheProvider.prototype.__getValue = function (key, callback) {
	var error, self = this;
	self.__client.hgetall(key, function (err, data) {
		if (!err && data) {
			error = null;
			console.log('获取redis数据成功');
		} else {
			error = new Error(err || 'RedisCache: get data is null');
			data = {value: ''};
			console.log('获取redis数据失败')
		}
		callback && callback(error, data);
	});
};

/**
 * 单个数据存储
 * @param key {string}
 * @param value {string}
 * @param callback {Function}
 * @private
 */
RedisCacheProvider.prototype.__setValue = function (key, value, callback) {
	var error, self = this;
	self.__client.hmset(key, value, function (err, data) {
		if (!err) {
			error = null;
			console.log('设置redis数据成功');
		} else {
			error = new Error(err || 'RedisCache: set data system error');
			console.log('设置redis数据失败');
		}
		callback && callback(error, data);
	});
};

/**
 * 数据删除
 * @param key {string} or {array}
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
			console.log('删除redis数据成功')
		} else {
			error = err || 'RedisCache: del data system error';
			console.log('删除redis数据失败')
		}
		callback && callback(err, data);
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
			console.log('设置redis过期时间成功')
		} else {
			error = err || 'RedisCache: setExpirationTime system error';
			console.log('设置redis过期时间失败')
		}
		callback && callback(err, data);
	});
};

/**
 * 对 普遍key 做判断处理
 * @param key
 * @returns {*}
 *          'only_node_' + string key or false
 */
function transformKey(key) {
	if (key) {
		var keyCopy;
		if (Object.prototype.toString.call(key) == "[object String]") {
			keyCopy = 'only_node_' + key;
		} else {
			keyCopy = 'only_node_' + JSON.stringify(key)
		}
		return keyCopy;
	} else {
		return false;
	}
}

/**
 * 对 需要删除的 key 做判断处理
 * @param key
 * @returns {*}
 *          'only_node_' + string key or false
 */
function transformArrayKey(key) {
	if (key) {
		var keyCopy;
		if (Object.prototype.toString.call(key) == "[object String]") {
			keyCopy = 'only_node_' + key;
		} else {
			if (Object.prototype.toString.call(key) == "[object Array]") {
				keyCopy = key.map(function (v) {
					if (Object.prototype.toString.call(v) == "[object String]") {
						return 'only_node_' + v
					} else {
						return 'only_node_' + JSON.stringify(v)
					}
				})
			} else {
				keyCopy = 'only_node_' + JSON.stringify(key)
			}
		}
		return keyCopy;
	} else {
		return false;
	}
}

exports = module.exports = RedisCacheProvider;

var BaseProvider = require('../BaseProvider');
var Redis = require('ioredis');
var config = require('../../test/redisConfig');
var CacheData = require('../../structs/CacheData');

// 判断环境，适用不同的集群
var envMap = {
	development: '-development',
	test: '-test',
	staging: '-staging',
	production: ''
};

var suffix = envMap[process.env.NODE_ENV];
suffix = suffix === undefined ? '-development' : suffix;

var clusterDevelopmentList = config.clusterDevelopmentList,  // 本地调试集群端口号，走本地外网

    clusterTestList = config.clusterTestList,               // test & staging 调试集群端口号，走阿里云内网

    clusterProductionList = config.clusterProductionList;   // 线上生产集群端口号，走阿里云内网


// 不同环境 选取不同集群list
var clusterList = [];
switch (suffix){
	case '-development':
		clusterList = clusterDevelopmentList;
		break;
	case '-test':
		clusterList = clusterTestList;
		break;
	case '-staging':
		clusterList = clusterTestList;
		break;
	case '':
		clusterList = clusterProductionList;
		break;
	default:
		clusterList = clusterDevelopmentList;
}
// var cluster = new Redis.Cluster(clusterList);

function RedisCacheProvider(options) {
	BaseProvider.apply(this, arguments);
	if (! options) {
		options = {
			name: 'RedisCacheProvider'
		}
	}
	this._name = options.name || 'RedisCacheProvider';
	this._maxLength = options.length || Math.pow(2,22);
}

RedisCacheProvider.prototype = new BaseProvider();
RedisCacheProvider.prototype.constructor = RedisCacheProvider;

/**
 * set redis cache value
 * @param cacheData {object}
 * @param callback {Function}
 */
RedisCacheProvider.prototype._getValue = function(cacheData, callback){
	var key = transformKey(cacheData.key);
	if(key){
		this.__getValue(key, function(data){
			if(data.mark == 1){
				callback && callback(null, new CacheData(cacheData.key, cacheData.meta, data.data));
			}else{
				callback && callback(new Error(data.message))
			}
		});
	}else{
		callback && callback(new Error('RedisCache: transitive get key is err or undefined'))
	}
};

/**
 * set redis cache value
 * @param cacheData {object}
 * @param callback {Function}
 */
RedisCacheProvider.prototype._setValue = function(cacheData, callback){
	var key = transformKey(cacheData.key);
	var value = transformValue(cacheData.value);
	if(key){
		this.__setValue(key, value, function(data){
			if(data.mark == 1){
				callback && callback(null, new CacheData(cacheData.key, cacheData.meta, cacheData.value));
			}else{
				callback && callback(new Error(data.message))
			}
		});
	}else{
		callback && callback(new Error('RedisCache: transitive set key is err or undefined'))
	}
};

/**
 * delete redis cache value
 * @param cacheData {object}
 * @param callback {Function}
 */
RedisCacheProvider.prototype._deleteValue = function(cacheData, callback){
	var key = transformDeleteKey(cacheData.key);
	if(key){
		this.__deleteValue(key, function(data){
			if(data.mark == 1){
				callback && callback(null, new CacheData(cacheData.key, cacheData.meta, cacheData.value));
			}else{
				callback && callback(new Error(data.message))
			}
		});
	}else{
		callback && callback(new Error('RedisCache: transitive delete key is err or undefined'))
	}
};

/**
 * 得到队列
 * @param cacheData
 * @param callback {Function}
 */
RedisCacheProvider.prototype._load = function(cacheData, callback){
	var key = transformKey(cacheData.key);
	if(key){
		this.__getValue(key, function(data){
			if(data.mark == 1){
				callback && callback(null, new CacheData(cacheData.key, cacheData.meta, data.data));
			}else{
				callback && callback(new Error(data.message))
			}
		});
	}else{
		callback && callback(new Error('RedisCache: transitive load key is err or undefined'))
	}
};

/**
 * 存储队列
 * @param cacheData
 * @param callback
 * @private
 */
RedisCacheProvider.prototype._save = function(cacheData, callback){
	var key = transformKey(cacheData.key);
	var value = transformValue(cacheData.value);
	if(key){
		this.__setValue(key, value, function(data){
			if(data.mark == 1){
				callback && callback(null, new CacheData(cacheData.key, cacheData.meta, cacheData.value));
			}else{
				callback && callback(new Error(data.message))
			}
		});
	}else{
		callback && callback(new Error( 'RedisCache: transitive save key is err or undefined'));
	}
};

/**
 * 单个数据获取
 * @param key {string}
 * @param callback {Function}
 * @private
 */
RedisCacheProvider.prototype.__getValue = function(key, callback){
	var result = {};
	this.__cluster.get(key, function(err, data){
		if(!err && data){
			try{
				data = JSON.parse(data)
			}
			catch (err){
				
			}
			result = {
				mark: 1,
				data: data
			};
			console.log('获取redis数据成功');
		}else{
			result = {
				mark: -1,
				massage: err || 'RedisCache: get data is null'
			};
			console.log('获取redis数据失败')
		}
		callback && callback(result);
	});
};

/**
 * 单个数据存储
 * @param key {string}
 * @param value {string}
 * @param callback {Function}
 * @private
 */
RedisCacheProvider.prototype.__setValue = function(key, value, callback){
	var result = {};
	this.__cluster.set(key, value, function(err, data){
		if(!err){
			result = {
				mark: 1,
				data: data
			};
			console.log('设置redis数据成功')
		}else{
			result = {
				mark: -1,
				massage: err || (data || 'RedisCache: set data system error')
			};
			console.log('设置redis数据失败')
		}
		callback && callback(result);
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
RedisCacheProvider.prototype.__deleteValue = function(key, callback){
	var result = {};
	this.__cluster.del(key, function(err, data){
		if(!err){
			result = {
				mark: 1,
				data: data
			};
			console.log('删除redis数据成功')
		}else{
			result = {
				mark: -1,
				massage: err ||  'RedisCache: del data system error'
			};
			console.log('删除redis数据失败')
		}
		callback && callback(result);
	});
};

/**
 * 设置过期时间
 * @param key {string}
 * @param callback {Function}
 * @private
 */
RedisCacheProvider.prototype.__setExpirationTime = function(key, expireTime, callback){
	var result = {};
	this.__cluster.expire(key, parseInt(expireTime||0, 10), function(err, data){
		if(!err){
			result = {
				mark: 1,
				data: data
			};
			console.log('设置redis过期时间成功')
		}else{
			result = {
				mark: -1,
				massage: err || (data || 'system error')
			};
			console.log('设置redis过期时间失败')
		}
		callback && callback(result);
	});
};

/**
 * 初始化provider时才初始化redis
 */
RedisCacheProvider.prototype.__cluster = new Redis.Cluster(clusterList);

/**
 * 对 普遍key 做判断处理
 * @param key
 * @returns {*}
 *          'only_node_' + string key or false
 */
function transformKey(key){
	if(key){
		var keyCopy;
		if(Object.prototype.toString.call(key) == "[object String]"){
			keyCopy = 'only_node_' + key;
		}else{
			keyCopy = 'only_node_' + JSON.stringify(key)
		}
		return keyCopy;
	}else{
		return false;
	}
}

/**
 * 对 需要删除的 key 做判断处理
 * @param key
 * @returns {*}
 *          'only_node_' + string key or false
 */
function transformDeleteKey(key){
	if(key){
		var keyCopy;
		if(Object.prototype.toString.call(key) == "[object String]"){
			keyCopy = 'only_node_' + key;
		}else{
			if(Object.prototype.toString.call(key) == "[object Array]"){
				keyCopy = key.map(function(v){
					if(Object.prototype.toString.call(v) == "[object String]"){
						return 'only_node_' + v
					}else{
						return 'only_node_' + JSON.stringify(v)
					}
				})
			}else{
				keyCopy = 'only_node_' + JSON.stringify(key)
			}
		}
		return keyCopy;
	}else{
		return false;
	}
}

/**
 * 仅针对集群做value字符串化
 * @param value
 * @returns {string|*}
 */
function transformValue(value){
	var valueCopy;
	if(Object.prototype.toString.call(value) == "[object String]"){
		valueCopy = value;
	}else{
		valueCopy = JSON.stringify(value)
	}
	return valueCopy;
}

exports = module.exports = RedisCacheProvider;

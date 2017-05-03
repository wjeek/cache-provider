var redis = require('redis');
var BaseProvider = require('../BaseProvider');
var redisConfig = require('../../../demo/config/redisConfig');
var CacheData = require('../../structs/CacheData');
var CacheResult = require('../../structs/CacheResult');

var toString = Object.prototype.toString;

function RedisCacheProvider(options) {
	var self = this;
	options = options || {};
	this._name = options.name || 'RedisCache';
	this._maxLength = options.length || 40000;

	BaseProvider.apply(this, [{
		name: this._name,
		maxLength: this._maxLength
	}]);

	/**
	 * redis 默认参数
	 * @type {{port: number, host: string, retry_strategy: redisOptions.retry_strategy}}
	 *      .port            端口号
	 *      .host            服务器IP
	 *      .retry_strategy  连接异常处理设置,默认每2秒重新连接一次
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
	setInterval(self._getQueueSyncRedis.bind(self), 600000)
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
 *                              .name   {String}        标识取出源
 * @param callback {Function}
 */
RedisCacheProvider.prototype._getValues = function (cacheDataArr, callback) {
	var cacheDataArrTransform = transformData(cacheDataArr), self = this;
	if (!cacheDataArrTransform.length) {
		callback && callback(new Error('RedisCache: transitive get key is err or undefined'), new CacheResult());
		return false;
	}
	self.__getHashValue(cacheDataArrTransform, function (err, data) {
		var result = transformGetResult(data, cacheDataArr);
		callback && callback(err, result);
	});
};

/**
 * set redis cache value
 * @param cacheDataArr [Array]
 *                      .{Object}
 *                          .key        {String}         缓存数据的key
 *                          .value      {String/Object}  缓存数据的value
 *                          .meta       {Object}         缓存数据的其它信息
 *                          .extra      {Object}         额外信息
 *                              .name   {String}        标识取出源
 * @param callback {Function}
 */
RedisCacheProvider.prototype._setValues = function (cacheDataArr, callback) {
	var cacheDataArrTransform = transformData(cacheDataArr), self = this;
	if (!cacheDataArrTransform.length) {
		callback && callback(new Error('RedisCache: transitive set key is err or undefined'), new CacheResult());
		return false;
	}
	self.__setHashValue(cacheDataArrTransform, function (err, data) {
		var result = transformSetResult(data, cacheDataArr);
		callback && callback(err, result);
	});
};

/**
 * delete redis cache value
 * @param cacheDataArr [Array]
 *                      .{Object}
 *                          .key        {String}         缓存数据的key
 *                          .value      {String/Object}  缓存数据的value
 *                          .meta       {Object}         缓存数据的其它信息
 *                          .extra      {Object}         额外信息
 *                              .name   {String}        标识取出源
 * @param callback {Function}
 */
RedisCacheProvider.prototype._deleteValues = function (cacheDataArr, callback) {
	var keys = transformKey(cacheDataArr), self = this;
	if (!keys.length) {
		callback && callback(new Error('RedisCache: transitive delete key is err or undefined'), new CacheResult())
		return false;
	}
	self.__deleteValue(keys, function (err, data) {
		var result = transformDeleteResult(err, data, cacheDataArr);
		callback && callback(err, result);
	});
};

/**
 * delete all redis cache of 'only_node_*'
 * @param callback {Function}
 */
RedisCacheProvider.prototype._clearValue = function (callback) {
	var self = this;
	self.__client.keys('only_node_*', function(err, keys) {
		if(!err){
			self.__deleteValue(keys, function (error, data) {
				callback && callback(error, data);
			});
		}
	});
};

/**
 * 得到队列
 * @param callback {Function}
 */
RedisCacheProvider.prototype._load = function (callback) {
	var self = this;
	self.__client.keys('only_node_*', function(err, keys) {
		if(!err){
			var subArr = keys.map(function(item){
				return {
					hashKey: item,
					subKey: ['key', 'meta']
				}
			});
			self.__getHashSingleValue(subArr, function (err, data) {
				var queueObj = {}, _queue = {}, noMetaKeys = [];
				if(!err){
					(data || []).forEach(function(v, i){
						try{
							v[0] = JSON.parse(v[0]);
						}catch(e){
						}
						try{
							v[1] = JSON.parse(v[1]);
						}catch(e){
						}

						if(v[0]){
							_queue[v[0]] = v[1] || {};
						}else{
							noMetaKeys.push(keys[i]);
						}
					})
				}
				queueObj = {
					_queue: _queue,
					_length: Object.getOwnPropertyNames(_queue).length
				};
				callback && callback(err, queueObj);
				console.log("load success from redisCache to queue: length " + queueObj._length);
				if(noMetaKeys.length){
					self.__deleteValue(noMetaKeys);
				}
			});
		}else{
			callback && callback(err, {_queue: {},_length: 0});
		}
	});
};

// 得到信息 queue 及 自身索引
RedisCacheProvider.prototype._getInfo = function(cacheData, callback){
	var self = this,
		result = new CacheResult(),
		getQueueQueue = {},
		getRedisQueue = {};

	getQueueQueue = JSON.parse(JSON.stringify(self._queue || {}));
	// getQueueQueue.listKey = [];
	if(getQueueQueue._queue){
		// for(var x in getQueueQueue._queue){
		// 	getQueueQueue.listKey.push(x);
		// }
		delete getQueueQueue._queue;
	}

	result.success.push({"RedisCache queue of Queue": getQueueQueue});
	self._load(function(err, loadResult){
		getRedisQueue = JSON.parse(JSON.stringify(loadResult));

		// getRedisQueue.listKey = [];
		if(getRedisQueue._queue){
			// for(var x in getRedisQueue._queue){
			// 	getRedisQueue.listKey.push(x);
			// }
			delete getRedisQueue._queue;
		}
		result.success.push({"RedisCache queue of Cache": getRedisQueue});
		callback && callback(err, result);
	})
};

RedisCacheProvider.prototype._getQueueSyncRedis = function (callback) {
	var self = this, subArr  = [];
	if(self._queue && self._queue._queue){
		var queueReference = self._queue._queue;
		for(var x in queueReference){
			if(queueReference.hasOwnProperty(x)){
				subArr.push({
					hashKey: transformHashKey(x),
					subObj: {
						key: x,
						meta: JSON.stringify(queueReference[x] || {})
					}
				});
			}
		}
	}
	self.__setHashSingleValue(subArr, function (err, data) {
		callback && callback(err, data);
		console.log("From queue to redisCache, the queue: length " + (subArr && subArr.length) + ", redis result length:" + data && data.length);
	});

	function transformHashKey(key){
		if (toString.call(key) == '[object String]') {
			return 'only_node_' + key;
		} else {
			return 'only_node_' + JSON.stringify(key);
		}
	}
};

/**
 * 哈希形式得到键值对
 * @param hashCacheData {Array} 经过处理后的需要存储的数据
 *                      .key {String}
 *                      .hashKey {String} 取 hashCacheData 中的 hashKey 作为 hash 的 key
 *                      .value {String}
 *                      .extra {String}
 * @param callback  {Function}
 * @private
 */
RedisCacheProvider.prototype.__getHashValue = function(hashCacheData, callback){
	var error, self = this;
	var setList = [];
	hashCacheData.forEach(function(v, i){
		setList.push(['hgetall', v.hashKey])
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
 * 哈希形式得到子键的值 得到单个键的值 hmget('hash-key', array)
 * @param hashCacheData {Array} 经过处理后的需要存储的数据
 *                      .key {String}
 *                      .hashKey {String} 取 hashCacheData 中的 hashKey 作为 hash 的 key
 *                      .value {String}
 *                      .extra {String}
 * @param callback  {Function}
 * @private
 */
RedisCacheProvider.prototype.__getHashSingleValue = function(hashCacheData, callback){
	var error, self = this;
	var setList = [];
	hashCacheData.forEach(function(v, i){
		setList.push(['hmget', v.hashKey, v.subKey])
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
 * 哈希形式存储子键值对，hmset('hash-key', obj)
 * @param hashCacheData {Array} 经过处理后的需要存储的数据
 *                      .key {String}
 *                      .hashKey {String} 取 hashCacheData 中的 hashKey 作为 hash 的 key
 *                      .value {String}
 *                      .extra {String}
 * @param callback  {Function}
 * @private
 */
RedisCacheProvider.prototype.__setHashSingleValue = function(hashCacheData, callback){
	var error, self = this;
	var setList = [];
	hashCacheData.forEach(function(v, i){
		setList.push(['hmset', v.hashKey, v.subObj])
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
 * 哈希形式存储 redis 数据
 * @param hashCacheData {Array} 经过处理后的需要存储的数据
 *                      .key {String}
 *                      .hashKey {String} 取 hashCacheData 中的 hashKey 作为 hash 的 key
 *                      .value {String}
 *                      .extra {String}
 * @param callback  {Function}
 * @private
 */
RedisCacheProvider.prototype.__setHashValue = function(hashCacheData, callback){
	var error, self = this;
	var setList = [];
	hashCacheData.forEach(function(v, i){
		setList.push(['hmset', v.hashKey, v])
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
 * 对 普遍key 做判断处理
 * @param cacheDataArr
 * @returns {*}
 *          'only_node_' + string keys or false
 */
function transformKey(cacheDataArr) {
	var keyCopy = [];
	if (cacheDataArr) {
		if (toString.call(cacheDataArr) == '[object Object]') {
			keyCopy.push(cacheDataArr);
		} else if (toString.call(cacheDataArr) == '[object Array]') {
			keyCopy = cacheDataArr;
		}
		keyCopy = keyCopy.map(function (v) {
			if (toString.call(v.key) == '[object String]') {
				return 'only_node_' + v.key;
			} else {
				return 'only_node_' + JSON.stringify(v.key);
			}
		});
	}
	return keyCopy;
}

/**
 * 变换存储数据，將存储的key 重新命名为'only_node_key', value为总体data字符串化
 * @param data {Array}
 * @returns {Array}
 */
function transformData(data) {
	var data2 = JSON.parse(JSON.stringify(data));
	var dataArr = [];
	if (toString.call(data2) == '[object Array]') {
		dataArr = data2;
	} else if (toString.call(data2) == '[object Object]') {
		dataArr.push(data2);
	}
	dataArr.forEach(function (v, i) {
		for(var x in v){
			if (toString.call(v[x]) != '[object String]') {
				v[x] = JSON.stringify(v[x]);
			}
		}
		if (toString.call(v.key) == '[object String]') {
			v['hashKey'] = 'only_node_' + v.key;
		} else {
			v['hashKey'] = 'only_node_' + JSON.stringify(v.key);
		}
	});
	return dataArr;
}

/**
 * 转换删除后的结果
 * @param err
 * @param data
 * @param cacheDataArr
 * @returns {{success: Array, failed: Array}}
 */
function transformDeleteResult(err, data, cacheDataArr) {
	var result = new CacheResult();
	if (err) {
		result.failed = cacheDataArr;
	} else {
		result.success = cacheDataArr;
	}
	result.success.map(function(cacheData){
		if(cacheData && cacheData.extra){
			cacheData.extra.name = 'RedisCacheProvider';
			cacheData.extra.message = 'RedisCache: delete successfully!'
		} else {
			cacheData && (cacheData.extra = {
				name: 'RedisCacheProvider',
				message: 'RedisCache: delete successfully!'
			})
		}
	});
	result.failed.map(function(cacheData){
		if(cacheData && cacheData.extra){
			cacheData.extra.name = 'RedisCacheProvider';
			cacheData.extra.message = 'RedisCache: delete failed!'
		} else {
			cacheData && (cacheData.extra = {
				name: 'RedisCacheProvider',
				message: 'RedisCache: delete failed!'
			})
		}
	});
	return result;
}

/**
 * 转换批量得到后的结果
 * @param data
 * @param cacheDataArr
 * @returns {string|*}
 */
function transformGetResult(data, cacheDataArr) {
	var result = new CacheResult();
	(data || []).forEach(function (v, i) {
		var cacheDataCopy;
		if (v) {
			for(var x in v){
				try{
					v[x] = JSON.parse(v[x]);
				}catch (e){
				}
			}
			if (v.value && v.value.data && v.value.type == 'Buffer') {
				v.value = new Buffer(v.value.data);
			}
			cacheDataCopy = new CacheData(v.key, v.meta, v.value);
			cacheDataCopy.extra && (cacheDataCopy.extra.name = 'RedisCacheProvider');
			result.success.push(cacheDataCopy);
		} else {
			cacheDataCopy = new CacheData(cacheDataArr[i].key, cacheDataArr[i].meta, '');
			cacheDataCopy.extra && (cacheDataCopy.extra.name = 'RedisCacheProvider');
			result.failed.push(cacheDataCopy);
		}
	});
	return result;
}

/**
 * 转换批量设置返回的结果
 * @param data 批量set返回的结果，一一对应，'OK'为成功
 * @param cacheDataArr 传进的数据
 * @returns {{success: Array, failed: Array}}
 */
function transformSetResult(data, cacheDataArr) {
	var result = new CacheResult();
	(data || []).forEach(function (v, i) {
		if(cacheDataArr[i] && cacheDataArr[i].extra){
			cacheDataArr[i].extra.name = 'RedisCacheProvider';
		}else{
			cacheDataArr[i] && (cacheDataArr[i].extra = {name: 'RedisCacheProvider'})
		}
		if (v == 'OK' || v == 'ok') {
			result.success.push(cacheDataArr[i]);
		} else {
			result.failed.push(cacheDataArr[i]);
		}
	});
	return result;
}

exports = module.exports = RedisCacheProvider;

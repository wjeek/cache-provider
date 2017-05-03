var Queue = require('../structs/Queue');
var async = require('async');
var CacheResult = require('../structs/CacheResult');

function BaseProvider(options) {
	!options && (options = {});

	this._name = options.name || "BaseProvider";
	this._maxLength = options.maxLength || 100;

	var queueOption = {
		maxsize: this._maxLength,
		sortWeight: options.sortWeight || {},                          //sortWeight表示排序权重配置，JSON对象，key为属性，value为权值
		delNum: options.delNum || Math.ceil(this._maxLength / 10)     //队列满时一次性删除的数量
	};

	this._queue = new Queue(queueOption);
}

/**
 * constructor for BaseProvider
 */
BaseProvider.prototype.constructor = BaseProvider;

/**
 * get multiply values before provider && after provider
 * @param cacheData {Array}
 * @param callback {Function}
 */

BaseProvider.prototype.get = function(cacheData, callback) {
	var self = this;

	async.waterfall([
		function(cb){
			self._queue.get(cacheData, function(err, keyArray, failedArray){
				err ? cb(err, null) : cb(null, keyArray, failedArray)
			});
		},
		function(keyArray, failedArray, cb){
		    keyArray = arrayToObj(keyArray);

			if(keyArray.length > 0){
				self._getValues(keyArray, function(err, result){
					failedArray = failedArray.concat(result && result.failed.map(function(each){
							return each.key;
						}));
					result.failed = [{key: failedArray}];
					err ? cb(err, result) : cb(null, result);
				});
			}else{
				cb(null, {
					success: [],
					failed: arrayToObj(Array.isArray(cacheData.key) ? cacheData.key : [cacheData.key])
				})
			}
		}
	], function(err, result){
		callback(err, result)
	});
};

/**
 * set value to provider
 * @param cacheData {Object}
 * @param callback {Function}
 */
BaseProvider.prototype.set = function(cacheData, callback) {
	var self = this;

	async.waterfall([
		function(cb){
			self._queue.set(cacheData, function(delArray){
				cb(null, delArray);
			});
		},
		function(delArray, cb){
			var transferDelArray = arrayToObj(delArray);
			if (transferDelArray.length > 0){
				self._deleteValues(transferDelArray, function(err, result){
					err ? cb(err, false) : cb(null, result)
				});
			} else {
				cb(null, null);
			}
		},
		function(result, cb){
			self._setValues(cacheData, function(err, result2){
				cb(err, {
                    success: result2.success,
                    failed: []
                })
			});
		}
	], function(err, result){
		callback(err, result)
	});
};

/**
 * delete multiply values from provider
 * @param cacheData {Array}
 * @param callback {Function}
 */

BaseProvider.prototype.delete = function(cacheData, callback) {
	var self = this;

	async.waterfall([
		function(cb){
			self._queue.delete(cacheData, function(err, isSuccess){
				cb(err, isSuccess)
			});
		},
		function(isSuccess, cb){

			if(isSuccess){
				var keyArray = [], key = cacheData.key;

                if(typeof key === 'string'){
                	keyArray.push({'key': key})
				} else if (Array.isArray(key) && key.length > 0){
                	keyArray = arrayToObj(key)
				}

                self._deleteValues(keyArray, function(err, result){
                    cb(err, result);
                });
			} else {
				cb(null, false)
			}
		}
	], function(err, result){
		callback(err, result);
	});
};

BaseProvider.prototype.getInfo = function(cacheData, callback) {
	var self = this;
	self._getInfo(cacheData, function(err, result){
		callback && callback(err, result);
	})
};

BaseProvider.prototype.clear = function(callback){
	var self = this;

	self._clearValue(function(err){
		if(err){
			callback(err);
		}else{
			self._queue.clear();
			callback(true);
		}
	});
};

/**
 * open the provider
 */
BaseProvider.prototype.start = function(callback) {
	this._startProvider(callback);
};

/**
 * close the provider
 */
BaseProvider.prototype.stop = function(callback) {
	this._stopProvider(callback);
};

/**
 * protect method to get value from provider
 * @param cacheData {Object}
 * @param callback {Function}
 * @private
 */
BaseProvider.prototype._getValue = function(cacheData, callback){
	//callback();
};

/**
 * protect method to get multiply values from provider
 * @param cacheData {Object}
 * @param callback {Function}
 * @private
 */

BaseProvider.prototype._getValues = function(cacheData, callback){

};

/**
 * protect method to set value to provider
 * @param cacheData {Object}
 * @param callback {Function}
 * @private
 */
BaseProvider.prototype._setValue = function (cacheData, callback) {
	//callback(false);
};

/**
 * protect method to set multiply values to provider
 * @param cacheData {Array}
 * @param callback {Function}
 * @private
 */
BaseProvider.prototype._setValues = function (cacheData, callback) {
	//callback(false);
};

/**
 * protect method to delete value from provider
 * @param cacheData {Object}
 * @param callback {Function}
 * @private
 */
BaseProvider.prototype._deleteValue = function(cacheData, callback) {

};


/**
 * clear the cache provider
 * @private
 */
BaseProvider.prototype._clearValue = function(){

};

/**
 * protect method to start provider
 * @param callback {Object}
 * @private
 */
BaseProvider.prototype._startProvider = function(callback) {
	var self = this;
	this._load(function(err, dataList){
		self._queue.reload(dataList, function(isSuccess){
			callback && callback(isSuccess);
		});
	});
};

/**
 * protect method to stop provider
 * @private
 */
BaseProvider.prototype._stopProvider = function (callback){
	var self = this;
	self._queue.save(function(map){
		self._save(map, function(err, isSuccess){
			if(err){
				callback(err);
			} else {
				callback(isSuccess);
			}
		});
	})
};

/**
 * load data from provider
 * key {String}
 * callback {Function}
 * @private
 */
BaseProvider.prototype._load = function(callback){

};

/**
 * save data to provider
 * @param dataList {Array}
 * @param callback {Function}
 * @private
 */
BaseProvider.prototype._save = function(dataList, callback){

};

/**
 * load data from provider
 * key {String}
 * callback {Function}
 * @private
 */
BaseProvider.prototype.load = function(callback){
	this._load(callback);
};

/**
 * save data to provider
 * @param callback {Function}
 * @private
 */
BaseProvider.prototype.save = function(callback){
	this._stopProvider(callback);
};

function arrayToObj(array) {
	if(!Array.isArray(array)){
		return false
	}
	return array.map(function(each){
		return {'key': each}
	});
}

exports = module.exports = BaseProvider;


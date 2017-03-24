var Queue = require('../structs/Queue');
var async = require('async');

function BaseProvider(options) {
	!options && (options = {});

	this._name = options.name || "BaseProvider";
	this._maxLength = options.maxLength || 100;

	var queueOption = {
		maxsize: this._maxLength,
		sortWeight: options.sortWeight || {},                          //sortWeight表示排序权重配置，JSON对象，key为属性，value为权值
		delNum: options.delNum || Math.floor(this._maxLength / 2)     //队列满时一次性删除的数量
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
			}, false);
		},
		function(keyArray, failedArray, cb){
			if(keyArray.length > 0){
				self._getValues(keyArray, function(err, result){
					result.failed = result.failed.concat(failedArray);
					err ? cb(err, result) :
						self._queue.get(cacheData, function(){
							cb(null, result);
						}, true)
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
			}, false);
		},
		function(delArray, cb){
			if (delArray.length > 0){
                self._deleteValues(delArray, function(err, result){
	                err ? cb(err, false) : cb(null, result)
                });
			} else {
				cb(null, null);
			}
		},
		function(result, cb){
			var delKey = result && result.success && result.success.map(function(each){
					return each ? each.key : []
			});
			delKey && self._queue.delete({
				key: delKey
			});

			self._setValues(cacheData, function(err, result2){
				err ? cb(err, null) :
					self._queue.set(result2.success, function () {
						cb(null, {
							success: result2.success,
							failed: []
						});
					}, true);
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
			self._queue.get(cacheData, function(err, keyArray, failedArray){
				err ? cb(err) : cb(null, keyArray, failedArray)
			}, false);
		},
		function(keyArray, failedArray, cb){
			if(keyArray.length > 0){
				self._deleteValues(keyArray, function(err){
					err ? cb(err, false) :
						self._queue.delete(cacheData, function(err, isSuccess){
							cb(err, isSuccess)
						});
				});
			}else{
				cb(null, true)
			}

		}
	], function(err, result){
		callback(err, result)
	});
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
    this._load(function(dataList){
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

function arrayToObj(array) {
	if(!Array.isArray(array)){
		return false
	}
	var newArray = array.map(function(each){
		var obj = {
			'key': each
		};
		return obj
	});
	return newArray;
}

exports = module.exports = BaseProvider;


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
 * get value before provider && after provider
 * @param cacheData {Object}
 * @param callback {Function}
 */

BaseProvider.prototype.get = function(cacheData, callback) {
	var self = this;

	async.waterfall([
		function(cb){
			self._queue.get(cacheData, function(hasKey){
				if(!hasKey){
					cb({'key': key , 'value': null})
				}else{
					cb(null, cacheData);
				}
			}, false);
		},
		function(cacheData, cb){
			self._getValue(cacheData, function(err, result){
				if(!err){
					self._queue.get(cacheData, function(isGot){
						cb(null, result);
					}, true);
				}else{
					console.log(err);
					cb({'message': err || 'get data error in BaseProvider'})
				}
			});
		}
	], function(err, result){
		if(err){
			console.log(err);
			callback(err);
		} else {
			callback(null, result);
		}
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
			self._queue.set(cacheData, function(delArr){
				cb(null, delArr);
			}, false);
		},
		function(delArr, cb){
			if (delArr.length > 0){
                self._deleteValue(delArr, function(err){
                    if(!err){
                        cb(null, cacheData)
                    }else{
                        console.log(err);
                        cb('delete data error' );
                    }
                });
			} else {
				cb(null, cacheData);
			}
		},
		function(cacheData, cb){
			self._setValue(cacheData, function(err){
				if(!err){
					 self._queue.set(cacheData, function(result){
					    cb(null, result);
					 }, true);
				}else{
					console.log(err);
					cb('set data error' );
				}
			});
		}
	], function(err, result){
		if(err){
			console.log(err,result);
			callback(err);
		} else {
			callback(null, true);
		}
	});
};

/**
 * delete the value from provider
 * @param cacheData {Object}
 * @param callback {Function}
 */

BaseProvider.prototype.delete = function(cacheData, callback) {
	var self = this;

	async.waterfall([
		function(cb){
			self._queue.get(cacheData, function(hasKey){
				if(!hasKey){
					cb(new Error('queue callback: get no data'))
				}else{
					cb(null, cacheData);
				}
			}, false);
		},
		function(cacheData, cb){
			self._deleteValue(cacheData, function(err){
				if(!err){
					var isDeleted = self._queue.del(cacheData);
					isDeleted ?
						cb(null, true) :
						console.log('queue callback:delete error');
				}else{
					console.log('BaseProvider callback:delete error');
					cb(null, false);
				}
			});
		}
	], function(err, result){
		if(err){
			console.log(err);
			callback(false);
		} else {
			callback(result);
		}
	});
};

BaseProvider.prototype.clear = function(callback){
    this._clearValue();
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

};

/**
 * protect method to set value to provider
 * @param cacheData {Object}
 * @param callback {Function}
 * @private
 */
BaseProvider.prototype._setValue = function (cacheData, callback) {

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
    	try{
		    self._queue.reload(dataList, callback);
	    }catch(e){
    		console.log(e);
    		callback && callback(false);
	    }

    });
};

/**
 * protect method to stop provider
 * @private
 */
BaseProvider.prototype._stopProvider = function (callback){
	var self = this;
	self._queue.save(function(map){
		if(!map){
			console.log(new Error('queue save error'));
			callback && callback(false);
		}else{
			self._save(map, callback);
		}
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

exports = module.exports = BaseProvider;

// var a = new BaseProvider();
// a.set({key:1,value:''},function(){});
// a.get({key:1},function(){console.log(a)});
// a.delete({key:1},function(){console.log(a)});

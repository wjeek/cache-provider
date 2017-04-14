/**
 * Created by jove_wang on 2017/3/14.
 */

function Node(meta) {
	this.expire_time = (meta && meta.expire) || 86400000;
	this.update_time = this.visit_time = this.creat_time = getTime();
	this.visit_count = 1;
	this.toDelete = false;
}

function Queue(queueOption) {
	!queueOption && (queueOption = {});
	this._maxsize = queueOption.maxsize || 100;
	this._delNum = queueOption.delNum || Math.ceil(this._maxsize / 10);
	this._length = 0;
	this._sortWeight = Object.assign({'visit_count': 1, 'toDelete': -9999999}, queueOption.sortWeight);
	this._queue = {};
}

/**
 * get multiply keys from queue ,
 * @param isAfterGet {Boolean} 用来判断是否对queue进行写操作
 * @param cacheData {Object}
 * @param callback {Function}
 */

Queue.prototype.get = function(cacheData, callback) {
	var queue = this._queue;
	var keyArray = [];
	var failedArray = [];
	var curTime = getTime();

	if(!cacheData || !cacheData.key){
		callback(new Error('get: data format is wrong'));
		return;
	}
	var key = cacheData.key;

	if(typeof key === 'string'){
		getKeys(key);
	}else if(Array.isArray(key)){
		key.forEach(function(each){
			getKeys(each);
		});
	}

	var tempArray = arrayToObj(keyArray);
	tempArray.forEach(function(each){
		each.meta = queue[each.key]
	});

	callback(null, tempArray, failedArray);

	function getKeys(key){
		var curKey = queue[key];

		if(!curKey){
			failedArray.push(key);
		} else {
			var update_time = curKey.update_time;
			var expire_time = curKey.expire_time;

			if(expire_time && curTime - update_time > expire_time){
				curKey.toDelete = true;
			} else {
				curKey.visit_count++;
				keyArray.push(key);
			}

			curKey.visit_time = curTime;
		}
	}
};

/**
 * set multiply keys to queue ,
 * @param isAfterSet {Boolean} 用来判断是否对queue进行写操作
 * @param cacheData {Array}
 * @param callback {Function}
 */

Queue.prototype.set = function(cacheData, callback) {
	var self = this;
	var queue = this._queue;
	var delKeys = [];
	var curTime = getTime();

	if(!(Array.isArray(cacheData))){
		callback(new Error('set: data format is wrong'));
		return;
	}

	if(cacheData.length > self._maxsize){
		callback(new Error('set: data length is larger than the maxsize'));
		return;
	}

	var insertKey = [];

	cacheData.forEach(function(each){
		var key = each.key;
		var meta = each.meta || {};
		var node = queue[key];

		if(node){
			node.expire_time = meta.expire || node.expire_time;
			node.toDelete = false;
			node.update_time = curTime;
		} else {
			insertKey.push({key: key, meta: meta});
		}
	});

	if(insertKey.length <= self._maxsize - self._length){
		insertKey.forEach(function(each){
			queue[each.key] = new Node(each.meta);
			self._length++;
		});
	} else {
		var delLength = insertKey.length - (self._maxsize - self._length);
		var sortFunc = self._sortFunc(self._sortWeight);
		var sortKeys = Object.keys(queue).sort(sortFunc);

		while((sortKeys.length > self._length - delLength) || (sortKeys.length > self._maxsize - self._delNum)){
			var tailKey = sortKeys.pop();
			if(typeof tailKey !== 'undefined') {
				delKeys.push(tailKey);
			}
		}

		self.delete({key: delKeys});
		insertKey.forEach(function(each){
			queue[each.key] = new Node(each.meta);
			self._length++;
		});
	}

	callback && callback(arrayToObj(delKeys));
};

Queue.prototype.delete = function(cacheData, callback) {
	var self = this;
	var queue = self._queue;

	if(!cacheData || !cacheData.key){
		callback(new Error('get: data format is wrong'), false);
		return false;
	}

	var key = cacheData.key;

	if(typeof key === 'string'){

		var curKey = queue[key];
		if(!curKey){} else {
			delete queue[key];
			self._length--;
		}

	}else if(Array.isArray(key) && key.length > 0){

		key.forEach(function(each){
			var curKey = queue[each];
			if(!curKey){} else {
				delete queue[each];
				self._length--;
			}

		});
	}

	callback && callback(null, true);
};

Queue.prototype.reload = function(data, callback){

	try{
		if(data){
			var reloadQueue = JSON.parse(JSON.stringify(data));
			this._length = reloadQueue && reloadQueue.length;
			this._queue = reloadQueue && reloadQueue._queue;
			callback && callback(true);
		}else{
			callback && callback(false);
		}
	}catch(e){
		console.log(e);
		callback && callback(false);
	}

};

Queue.prototype.save = function(callback){
	var self = this;
	var saveData = {
		_queue: self._queue,
		length:　self._length
	};
	var map = JSON.parse(JSON.stringify(saveData));

	callback && callback(map);
};

Queue.prototype.clear = function(){
	this._length = 0;
	this._queue = {};
};

//返回队列中指定key的对象，不传参默认返回整个queue
Queue.prototype.getQueue = function(key, callback){
    var self = this;
    var result = {};
    if(key === 'all'){
        callback(JSON.parse(JSON.stringify(self._queue)))
    }else{

        if(typeof key === 'string'){
            getKeys(key);
        }else if(Array.isArray(key)){
            key.forEach(function(each){
                getKeys(each);
            });
        }
    }
    callback && callback(result);

    function getKeys(key) {
        if(self._queue[key]){
            var temp = Object.assign({}, self._queue[key]);
            !result[key] && (result[key] = temp);
        }
    }
};

Queue.prototype._sortFunc = function(settings) {
	var self = this;
	var queue = self._queue;
	var newSetting = JSON.parse(JSON.stringify(settings));    //example:  settings{'visit_count': 1}  visit_count 为 y=ax + by + cz里的 x，y，z; 1 为排序所对应的权值

	return function(key1, key2) {
		var valueFirst = 0,
			valueSecond = 0;
		var keys = Object.getOwnPropertyNames(newSetting);

		keys.forEach(function(eachKey){
			valueFirst += parseFloat(newSetting[eachKey] * queue[key1][eachKey]);
			valueSecond += parseFloat(newSetting[eachKey] * queue[key2][eachKey]);
		});

		return valueSecond - valueFirst ;
	}
};

function getTime() {
	return new Date().getTime()
}

function arrayToObj(array) {
	if(!Array.isArray(array)){
		return false
	}
	return array.map(function(each){
		return {'key': each}
	});
}

exports = module.exports = Queue;

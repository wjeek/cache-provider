/**
 * Created by jove_wang on 2017/3/14.
 */
var Immutable = require('immutable');

function Node(meta) {
	this.expire = (meta && meta.expire) || 86400000;
	this.updateTime = getTime();
	this.count = 1;
	this.toDelete = false;
}

function Queue(queueOption) {
	this._maxsize = queueOption.maxsize || 100;
	this._delNum = queueOption.delNum;
	this._length = 0;
	this._sortWeight = Object.assign({'count': 1}, queueOption.sortWeight);
	this._queue = {};
}

/**
 * get key from queue ,
 * @param isAfterGet {Boolean} 用来判断是否对queue进行写操作
 * @param key {String}
 * @param callback {Function}
 */

Queue.prototype.get = function(isAfterGet, key, callback) {
	var queue = this._queue;
	var curKey = queue[key];

	if(!curKey){
		callback && callback(false);
	} else {
		var updateTime = curKey.updateTime;
		var expire = curKey.expire;
		var curTime = getTime();

		if(expire && curTime - updateTime > expire){
			isAfterGet && (curKey.toDelete = true);
			callback && callback(false);
		} else {
			isAfterGet && (curKey.count++);
			callback && callback(true);
		}
	}
};

/**
 * set key to queue ,
 * @param isAfterSet {Boolean} 用来判断是否对queue进行写操作
 * @param key {String}
 * @param callback {Function}
 */

Queue.prototype.set = function(isAfterSet, key, meta, callback) {
	var self = this;
	var queue = this._queue;
	var node = queue[key];
	var delKeys = [];

	if(node && !node.toDelete){
		if(isAfterSet){
			node.expire = meta.expire || node.expire;
			node.count++;
		}

	} else if(node && node.toDelete) {

		delKeys.push(key);

		if(isAfterSet){
			self.del(key);
			self._length--;
		}
	}else{

		var newNode = new Node(meta);
		var curTime = getTime();

		for(var each in queue){
			var updateTime = each.updateTime;
			var expire = each.expire;
			if(expire && curTime - updateTime > expire){
				delKeys.push(each);
			}
		}
		if(delKeys.length < 1 && self._length == self._maxsize){

			var sortFunc = self._sortFunc(self._sortWeight);
			var sortKeys = Object.keys(queue).sort(sortFunc);

			while(sortKeys.length >= self._maxsize - self._delNum){
				var tailKey = sortKeys.pop();
				if(typeof tailKey !== 'undefined') {
					delKeys.push(tailKey);
				}
			}
		}

		if(isAfterSet) {
			delKeys.forEach(function(each){
				self.del(each);
			});
			queue[key] = newNode;
			self._length++
		}
	}

	callback && callback(delKeys);
};

Queue.prototype.del = function(key) {
	var self = this;
	if(self.queue[key]){
		delete self.queue[key];
		self._length--;
		return true;
	}
	return false;
};

Queue.prototype.reload = function(data, callback){

	try{
		var reloadQueue = JSON.parse(JSON.stringify(data));
		this._length = reloadQueue.length;
		this.queue = reloadQueue._queue;

		callback && callback(true);
	}catch(e){
		callback && callback(false);
	}

};

Queue.prototype.save = function(callback){

	try{
		var self = this;
		var saveData = {
			_queue: self._queue,
			length:　self._length
		};
		var map = Immutable.Map(saveData);

		callback && callback(map);
	}catch(e){
		callback && callback(false);
	}

};

Queue.prototype.clear = function(){
	this._length = 0;
	this.queue = {};
};

Queue.prototype._sortFunc = function(settings) {
	var self = this;
	var queue = self.queue;
	var newSetting = JSON.parse(JSON.stringify(settings));    //example:  settings{'count': 1}  count 为 y=ax + by + cz里的 x，y，z; 1 为排序所对应的权值

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

exports = module.exports = Queue;


// var c = new Queue(3);
// c.set('key1',{},function (keys) {});
// c.get('key1',function (is) {});
// c.set('key2',{},function (keys) {});
// c.set('key3',{},function (keys) {});
// c.get('key3',function (keys) {});
// c.set('key4',{},function () {
// 	console.log(c);
// });


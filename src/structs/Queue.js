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
	!queueOption && (queueOption = {});
	this._maxsize = queueOption.maxsize || 100;
	this._delNum = queueOption.delNum || Math.floor(this._maxsize / 2);
	this._length = 0;
	this._sortWeight = Object.assign({'count': 1, 'toDelete': -9999999}, queueOption.sortWeight);
	this._queue = {};
}

/**
 * get key from queue ,
 * @param isAfterGet {Boolean} 用来判断是否对queue进行写操作
 * @param cacheData {Object}
 * @param callback {Function}
 */

Queue.prototype.get = function(cacheData, callback, isAfterGet) {
	var key = cacheData.key || '';
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
 * get multiply keys from queue ,
 * @param isAfterGet {Boolean} 用来判断是否对queue进行写操作
 * @param cacheData {Object}
 * @param callback {Function}
 */

Queue.prototype.getValues = function(cacheData, callback, isAfterGet) {
	var queue = this._queue;
	var keyArray = [];
	var curTime = getTime();

	if(!(Object.prototype.toString.call(cacheData) === '[object Array]')){
		callback(new Error('get: data format is wrong'));
		return;
	}

	for(var each in cacheData){
		var key = cacheData[each].key;
		var curKey = queue[key];

		if(!curKey){

		} else {
			var updateTime = curKey.updateTime;
			var expire = curKey.expire;

			if(expire && curTime - updateTime > expire){
				isAfterGet && (curKey.toDelete = true);
			} else {
				isAfterGet && (curKey.count++);
				keyArray.push(key);
			}
		}
	}

	callback(null, keyArray);
};

/**
 * set key to queue ,
 * @param isAfterSet {Boolean} 用来判断是否对queue进行写操作
 * @param cacheData {Object}
 * @param callback {Function}
 */

Queue.prototype.set = function(cacheData, callback, isAfterSet) {
	var self = this;
	var queue = this._queue;

	var key = cacheData.key || '';
	var meta = cacheData.meta || {};

	var node = queue[key];
	var delKeys = [];
	var curTime = getTime();

	if(node){
		if(isAfterSet){
			node.expire = meta.expire || node.expire;
			node.count++;
			node.toDelete = false;
			node.updateTime = curTime;
		}
	} else {
		if(self._length == self._maxsize){
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
			var newNode = new Node(meta);
			delKeys.forEach(function(each){
				self.del({'key': each});
			});
			queue[key] = newNode;
			self._length++
		}
	}

	callback && callback(delKeys);
};

/**
 * set multiply keys to queue ,
 * @param isAfterSet {Boolean} 用来判断是否对queue进行写操作
 * @param cacheData {Array}
 * @param callback {Function}
 */

Queue.prototype.setValues = function(cacheData, callback, isAfterSet) {
	var self = this;
	var queue = this._queue;
	var delKeys = [];
	var curTime = getTime();

	if(!(Object.prototype.toString.call(cacheData) === '[object Array]')){
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
			if(isAfterSet){
				node.expire = meta.expire || node.expire;
				node.count++;
				node.toDelete = false;
				node.updateTime = curTime;
			}
		} else {
			insertKey.push({key: key, mata: meta});
		}
	});

	if(insertKey.length <= self._maxsize - self._length){
		isAfterSet && insertKey.forEach(function(each){
			var newNode = new Node(each.meta);
			queue[each.key] = newNode;
			self._length++;
		});
	} else {
		var delLength = insertKey.length - (self._maxsize - self._length);
		var sortFunc = self._sortFunc(self._sortWeight);
		var sortKeys = Object.keys(queue).sort(sortFunc);

		delLength = delLength > self._delNum ? delLength : self._delNum;

		while(sortKeys.length >= self._maxsize - delLength){
			var tailKey = sortKeys.pop();
			if(typeof tailKey !== 'undefined') {
				delKeys.push(tailKey);
			}
		}

		if(isAfterSet) {
			delKeys.forEach(function(each){
				self.del({'key': each});
			});
			insertKey.forEach(function(each){
				var newNode = new Node(each.meta);
				queue[each.key] = newNode;
				self._length++;
			});
		}
	}

	callback && callback(delKeys);
};

Queue.prototype.del = function(cacheData) {
	var key = cacheData.key || '';
	var self = this;

	if(self._queue[key]){
		delete self._queue[key];
		self._length--;
		return true;
	}
	return false;
};

Queue.prototype.deleteValues = function(cacheData) {

	try{
		var self = this;
		var queue = self._queue;

		if(!(Object.prototype.toString.call(cacheData) === '[object Array]')){
			console.log('delete: data format is wrong');
			return false;
		}

		for(var each in cacheData){
			var key = cacheData[each].key;
			var curKey = queue[key];

			if(!curKey){

			} else if(queue[key]){
				delete queue[key];
				self._length--;
			}
		}
		return true;

	}catch(e){
		console.log(e);
		return false;
	}
};

Queue.prototype.reload = function(data, callback){

	try{
		var reloadQueue = JSON.parse(JSON.stringify(data));
		this._length = reloadQueue.length;
		this._queue = reloadQueue._queue;

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
	this._queue = {};
};

Queue.prototype.print = function(key){
	var self = this;
	if(typeof key === 'undefined'){
		console.log(Object.getOwnPropertyNames(self._queue));
	}else{
		console.log(self._queue[key]);
	}
};

Queue.prototype._sortFunc = function(settings) {
	var self = this;
	var queue = self._queue;
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



// var c = new Queue({maxsize: 8});
// for(var i = 0;i < 7;i++){
// 	if(i == 2 || i == 4){
// 		c.set({key:'key' + i,meta:{expire: 1000}},function () {}, true);
// 	}else{
// 		c.set({key:'key' + i,meta:{}},function () {}, true);
// 	}
// }
// console.log(c);
// getAgain('key2', 3);
// getAgain('key4', 3);
// getAgain('key7', 4);
// c.setValues([
// 	{key:'key10',meta:{}},
// 	{key:'key11',meta:{}},
// 	{key:'key12',meta:{}},
// 	{key:'key13',meta:{}},
// 	{key:'key14',meta:{}}
// 	],
// 	function(){}, true);
// console.log(c);
// setTimeout(function(){
// 	getAgain('key2', 1);
// 	c.set({key:'key10',meta:{}},function () {}, true);
// }, 3000);
// c.getValues([{key: 'key1'},{key: 'key2'},{key: 'key9'}], function(err, array){
//      console.log(array)
// }, true);
//c.deleteValues([{key: 'key3'}, {key: 'key6'}, {key: 'key9'}]);
// function getAgain(key, times){
// 	for(var i = 0;i< times;i++){
// 		c.get({key:key,meta:{}},function (err) {}, true);
// 	}
// }
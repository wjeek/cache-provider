var Link = require('./old_link');


/**
 * Created by jove_wang on 2017/3/13.
 *
 * Queue层和Link层拆开.
 * Queue层维护insert、update、del等业务逻辑方法
 * Link层维护操作队列的抽象方法
 *
 * @Class Queue
 * @param maxsize
 * @constructor
 */

function Queue(maxsize) {
	this.maxsize = maxsize || 10000;
	this.length = 0;
	this.queue = new Link.Link();
}

/**
 * 没存过的页面调用insert插入节点
 * @param node {Object}
 */

Queue.prototype.insert = function(key) {
	var node = new Link.Node(key);
	var delKey = [] ;

	while(this.queue.length >= this.maxsize){
		delKey.push(this.queue.pop().key) ;
		this.length--;
	}

	this.queue.push(node);
	this.length++;

	return {
		node: node,
		delKey: delKey
	}
};

/**
 * 已经存过的页面调用update更新节点,表示再次访问某页面
 * @param node {Object}
 */

Queue.prototype.update = function(node) {
	var prevNode = node.prev;
	var nextNode = node.next;
	var queue = this.queue;

	node.count++;

	var isForward = ( prevNode && node.count > prevNode.count );
	var isBack = ( nextNode && node.count < nextNode.count );

	if(isForward){
		while(isForward){
			queue.forward(node);
			prevNode = node.prev;
		}
	}else if(isBack){
		while(isBack){
			queue.backward(node);
			nextNode = node.next;
		}
	}
};

/**
 * 删除页面的key 调用del删除节点
 * @param node {Object}
 */

Queue.prototype.del = function(node) {
	var key = this.queue.del(node);
	key && this.length--;
};

/**
 * 删除指定数量节点
 * @param num {Number}
 */

Queue.prototype.delQuantity = function(num) {
	if(parseInt(num , 10)){
		var delKey = this.queue.delQuantity(num);
		this.length -= delKey.length;
	} else {
		console.log('delete error');
	}
};

/**
 * 返回指定数量节点对应的key
 * isTop为true时从队列头部开始取，反之从尾部开始取
 * @param num {Number}
 * @param isTop {Boolean}
 */

Queue.prototype.printKeys = function(num, isTop) {
	var queue = this.queue;

	if(typeof isTop === 'undefined'){
		isTop = true;
	}
	if(parseInt(num , 10)){
		return queue.printKeys(num, isTop);
	} else {
		console.log('print error');
	}

};

//Queue.prototype = new Array();

exports = module.exports = Queue;

//example

// var queue = new Queue(5);
// var node = queue.insert('keyFirst');
// var node4 = queue.insert('keyFourth');
//
// queue.insert('keySecond');
// queue.insert('keyThird');
// queue.insert('keyFifth');
// queue.insert('keySixth');
//
// queue.update( node.node );
// queue.update(node4.node);
//
// console.log(queue);

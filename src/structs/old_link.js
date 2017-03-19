/**
 * Created by jove_wang on 2017/3/13.
 */

/**
 * Link层维护node节点的数据结构
 * node不负责具体的数据存储，只用于实现更新替换策略
 * 队列从头到尾保存的顺序按照count值大小排序，count越大越靠前。
 * 新添加的节点默认到队列尾部，如果length超过maxsize，则先删除尾部的节点再添加
 * 缓存中每一个键值对象的值包含了一个node，这些node都是队列的引用
 *
 * @Class Node
 * @param key {String}
 */

function Node(key) {
	this.key = key;
	this.count = 1;
	this.prev = null;
	this.next = null;
}

function Link() {
	this.length = 0;
	this.head = this.tail = null;
}

/**
 * 添加节点到队列尾部
 */

Link.prototype.push = function(node) {

	if (!this.tail) {
		this.head = this.tail = node;
	} else {
		this.tail.next = node;

		node.prev = this.tail;

		this.tail = node;
	}

	this.length++;
};

/**
 * 删除并返回尾节点
 */

Link.prototype.pop = function() {
	var tailNode = this.tail;

	if(tailNode.prev){
		tailNode.prev.next = null;
		this.tail = tailNode.prev;
	} else {
		this.head = this.tail = null;
	}

	this.length-- ;

	return tailNode;
};

/**
 * 插入到头结点,此方法仅在LRU算法当中调用，单纯的先进先出
 * @param node {Object}
 */

Link.prototype.unShift = function(node) {
	if(!this.length){
		this.head = this.tail = node;
	}else{
		this.head.prev = node;
		node.next = this.head;
		this.head = node;
	}
	this.length++;

	return node;
};

/**
 * 根据count排序 向前一个节点进行更换
 * @param node {Object}
 */

Link.prototype.forward = function(node) {
	var prevNode = node.prev;
	var nextNode = node.next;

	if (!prevNode)  return;

	// prevNode是头节点
	if (!prevNode.prev) {

		// 只有两个节点
		if (!nextNode) {

			node.prev = null;
			node.next = prevNode;

			prevNode.prev = node;
			prevNode.next = null;

			this.tail = prevNode;
			this.head = node;

		} else {

			nextNode.prev = prevNode;

			prevNode.next = nextNode;
			prevNode.prev = node;

			node.next = prevNode;
			node.prev = null;

			this.head = node;
		}
	} else {
		var beforePreNode = prevNode.prev;

		if (!nextNode) {
			beforePreNode.next = node;

			node.next = prevNode;
			node.prev = beforePreNode;

			prevNode.prev = node;
			prevNode.next = null;

			this.tail = prevNode;
		} else {
			beforePreNode.next = node;

			node.next = prevNode;
			node.prev = beforePreNode;

			prevNode.prev = node;
			prevNode.next = nextNode;

			nextNode.prev = prevNode;
		}
	}
};

/**
 * 根据count排序 向后一个节点进行更换
 * @param node {Object}
 */

Link.prototype.backward = function(node) {
	var prevNode = node.prev;
	var nextNode = node.next;

	if (!nextNode) return;
	if (!nextNode.next) {

		// 只有两个节点
		if (!prevNode) {
			nextNode.next = node;
			nextNode.prev = null;

			node.prev = nextNode;
			node.next = null;

			this.head = nextNode;
			this.tail = node;
		} else {
			prevNode.next = nextNode;

			nextNode.next = node;
			nextNode.prev = prevNode;

			node.next = null;
			node.prev = nextNode;

			this.tail = node;
		}
	} else {
		var afterNextNode = nextNode.next;

		if (!prevNode) {
			nextNode.next = node;
			nextNode.prev = null;

			node.next = afterNextNode;
			node.prev = nextNode;

			afterNextNode.prev = node;

			this.head = nextNode;
		} else {
			prevNode.next = nextNode;

			nextNode.next = node;
			nextNode.prev = prevNode;

			node.next = afterNextNode;
			node.prev = nextNode;

			afterNextNode.prev = node;
		}
	}
};

/**
 * 删除某个节点
 * @param node {Object}
 */

Link.prototype.del = function(node) {
	var prevNode = node.prev;
	var nextNode = node.next;

	if(!prevNode && nextNode) {             //队首

		this.head = nextNode;
		nextNode.prev = null;

	}else if(prevNode && nextNode) {        //队中

		prevNode.next = nextNode;
		nextNode.prev = prevNode;

	}else if(prevNode && !nextNode) {       //队尾

		this.tail = prevNode;
		prevNode.next = null;

	}else if(!prevNode && !nextNode) {      //只有一个节点
		this.head = this.tail = null;
	}

	this.length--;

	return node['key'];
};

/**
 * 删除制定数量节点,默认从count值最小的开始删除
 * @param num {Number}
 */

Link.prototype.delQuantity = function(num) {
	var tailNode = this.tail;
	var count = 0;
	var delKey = [];
	while(count < num && tailNode ){
		var key = this.del(tailNode);
		delKey.push(key);
		count++;
	}

	return delKey;
};
/**
 * 清除队列
 */

Link.prototype.clear = function() {
    this.length = 0;
    this.head = this.tail = null;
};

Link.prototype.printKeys = function(num, isTop) {
	var count = 0;
	var pointer = isTop ? this.head : this.tail;
	var arr = [];
	while (pointer && count < num ) {
		arr.push(pointer.key);
		pointer = isTop ? pointer.next : pointer.prev;
	}
	console.log(arr.join(", "));
	return arr;
};

var exportsItem = {
	Link: Link ,
	Node: Node
};

exports = module.exports = exportsItem;

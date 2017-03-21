var async = require('async');
var DefaultCacheProvider = require('./providers/simple/MemoryCacheProvider');
var event = require('events');
var addTaskEventEmitter = new event.EventEmitter();

/**
 * @Class CacheManager
 * @constructor
 * @param options {Object}
 *                .provider {Provider}
 */
function CacheManager(options) {
    if (!(this instanceof CacheManager)) {
        return new CacheManager(options);
    }

    this._options = Object.assign({
        provider: new DefaultCacheProvider()
    }, options);

    this._provider = this._options.provider;

    this._middlewareListBefore = [];

    this._middlewareListAfter = [];

    //events
    this._addTaskEventEmitter = addTaskEventEmitter;
    //添加一个使用完cache模块后的异步任务
    this._addTaskEventEmitter.on('addTask', function (task) {
        setImmediate(function () {
            task();
        });
    });
    //集群服务器时，worker向master传递消息
    this._addTaskEventEmitter.on('transfer', function () {
        setImmediate(function () {

        });
    });

    //集群
    this._cluster = this._options.cluster;
}

/**
 * Get cached value
 * @method get
 * @param key {String}
 * @param callback {Function}
 */
CacheManager.prototype.get = function (key, callback) {
    if (!isValidKey(key)) {
        throw new TypeError('app.get() requires a key string');
    }

    if (!isValidFunction(callback)) {
        throw new TypeError('app.get() requires callback function');
    }

    this.handle({key:key, action:'get'}, function (err, result) {
        callback(err, result);
    });
};

/**
 * Set cached value
 * @method set
 * @param key {String}
 * @param value
 * @param callback {Function}
 */
CacheManager.prototype.set = function (key, value, callback) {
    if (!isValidKey(key)) {
        throw new TypeError('app.set() requires a key string');
    }

    if (!isValidValue(value)) {
        throw new TypeError('app.set() requires a valid value');
    }

    this.handle({key:key, value:value, action:'set'}, function (err, result) {
        callback(err, result);
    });
};


/**
 * Delete cached value
 * @method delete
 * @param key {String}
 * @param callback {Function}
 */
CacheManager.prototype.delete = function (key, callback) {
    if (!isValidKey(key)) {
        throw new TypeError('app.delete() requires a key string');
    }

    if (!isValidFunction(callback)) {
        throw new TypeError('app.delete() requires callback function');
    }

    this.handle({key:key, action:'delete'}, function (err, result) {
        callback(err, result);
    });
};


/**
 * Clear all cached values
 * @method clear
 * @param callback {Function}
 */
CacheManager.prototype.clear = function (callback) {
    if (!isValidFunction(key)) {
        throw new TypeError('app.clear() requires callback function');
    }

    this.handle({key:key, action:'clear'}, function (err, result) {
        callback(err, result);
    });
};

/**
 * add async tasks
 * @method addTask
 * @param task {Function}
 */
CacheManager.prototype.addTask = function addTask(task) {
    this._addTaskEventEmitter.emit('addTask', task);
};

/**
 * Call the middleware
 * @method use
 * @param middleware {Object}
 */
CacheManager.prototype.use = function use(middleware) {
    if (!isValidObject(middleware)) {
        throw new TypeError('app.use() requires middleware object');
    }

    this._middlewareListBefore.push(middleware);
    this._middlewareListAfter = [middleware].concat(this._middlewareListAfter);
};

/**
 * handle middlewares and get data from providers
 * @method handle
 * @param query {Object}
 *              .action{String}         当前的处理逻辑（eg:get）
 *              .stage {String}         当前的处理逻辑阶段（eg:get前）
 *              .key   {String}         缓存数据的key
 *              .value {String/Object}  缓存数据的value
 *              .meta  {Object}         缓存数据的其它信息
 * @param callback {Function}
 */
CacheManager.prototype.handle = function (query, callback) {
    var self = this;
    var cluster = this._cluster

    if (cluster) {
        if (cluster.isMaster) {
            cluster.on('message',function (msg) {
                if (msg == 'transfer') {
                    console.log('abcd');
                }
            });
        } else if (cluster.isWorker) {
            cluster.worker.send('transfer');
            console.log('abcde');
            // cluster.worker.on('message', function (msg) {
            //     if (msg.type == 'cacheManager') {
            //         self = msg.cacheManager;
            //     }
            // });
        }
    }

    //处理provider前
    var beforeMiddlewareList = self._handleMiddleware('before',query);

    //处理provider
    var handleProvider = [
        function (callback) {
            self._handleProvider(query, callback);
        }
    ];

    //处理provider后
    var afterMiddlewareList = self._handleMiddleware('after',query);

    var handleList = beforeMiddlewareList.concat(handleProvider).concat(afterMiddlewareList);
    async.series(handleList, function(err){
        callback(err, query);
    });
};

/**
 * handle middlewares
 * @method _handleMiddleware
 * @param query {Object}
 *              .action{String}         当前的处理逻辑（eg:get）
 *              .stage {String}         当前的处理逻辑阶段（eg:get前）
 *              .key   {String}         缓存数据的key
 *              .value {String/Object}  缓存数据的value
 *              .meta  {Object}         缓存数据的其它信息
 * @param callback {Function}
 */
CacheManager.prototype._handleMiddleware = function (stage, query, callback) {


    //处理前后的middleWare
    if (stage == 'before') {
        var middlewareList = this._middlewareListBefore;
    } else {
        var middlewareList = this._middlewareListAfter;
    }

    return middlewareList.map(function (middleware) {

        return function (callback) {
            //eg:beforeGet = 'before' + 'get'
            query.stage = stage + query.action;
            middleware.process(query, callback);
        }
    });
};

/**
 * get data from providers
 * @method _handleProvider
 * @param query {Object}
 *              .action{String}         当前的处理逻辑（eg:get）
 *              .stage {String}         当前的处理逻辑阶段（eg:get前）
 *              .key   {String}         缓存数据的key
 *              .value {String/Object}  缓存数据的value
 *              .meta  {Object}         缓存数据的其它信息
 * @param callback {Function}
 */
CacheManager.prototype._handleProvider = function (query, callback) {

    var action = query.action;

    if (this._provider[action]) {
        this._provider[action](query, function (err, cacheData) {
            if (cacheData) {
                query = Object.assign(query, cacheData);
                callback(null);
            } else {
                callback(err);
            }
        })
    } else {
        throw new TypeError('provider can not support "' + data.action + '"' );
    }
}

/**
 * @Function isValidKey
 * @param str {String}
 */
function isValidKey(str) {
    return (str && Object.prototype.toString.call(str) == "[object String]");
}

/**
 * @Function isValidValue
 * @param value
 */
function isValidValue(value) {
    return !!value;
}

/**
 * @Function isValidObject
 * @param obj {Object}
 */
function isValidObject(obj) {
    return (obj && Object.prototype.toString.call(obj) == "[object Object]");
}

/**
 * @Function isValidFunction
 * @param fn {Function}
 */
function isValidFunction(fn) {
    return (fn && Object.prototype.toString.call(fn) == "[object Function]");
}

module.exports = CacheManager;
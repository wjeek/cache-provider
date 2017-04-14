var async = require('async');
var DefaultCacheProvider = require('./providers/simple/MemoryCacheProvider');
var event = require('events');

/**
 * @Class CacheManager
 * @constructor
 * @param options {Object}
 *                .provider {Provider}
 *                .cluster {Provider} 集群
 *                .asyncTaskMax {Integer} 调用者最大的异步并发量
 */
function CacheManager(options) {
    event.EventEmitter.call(this,arguments);

    var self = this;

    if (!(this instanceof CacheManager)) {
        return new CacheManager(options);
    }

    this._options = Object.assign({
        provider: new DefaultCacheProvider()
    }, options);

    this._provider = this._options.provider;

    this._middlewareListBefore = [];

    this._middlewareListAfter = [];

    //异步消息队列并行的最大数量
    this._maxCount = this._options.asyncTaskMax || 10;
    //异步消息队列并行
    this._taskQueue = async.queue(function(task, callback) {
        task();
        callback();
    }, this._maxCount);

    //添加一个使用完cache模块后的异步任务
    this.on('addTask', function (task) {
        self._taskQueue.push(task, function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log(task.name + 'has been exected');
            }
        });
    });

    //集群
    this._cluster = this._options.cluster;

    //error
    this.on('error', function (err) {
        console.log(err);
    })

    this.start();

    // var saveIndexInterval = parseInt(this._options.saveIndexInterval);

    // if (saveIndexInterval > 0) {
    //     setInterval(function () {
    //         self._provider.save(function () {
    //             //TODO
    //             console.log("all ready save queue")
    //         });
    //     }, saveIndexInterval * 1000);
    // }
}

CacheManager.prototype = Object.create(event.EventEmitter.prototype);
CacheManager.prototype.constructor = CacheManager;

/**
 * Get cached value
 * @method start
 * @param callback {Function}
 */
CacheManager.prototype.start = function (callback) {
    this._provider.start(callback);
};

/**
 * Get cached value
 * @method stop
 * @param callback {Function}
 */
CacheManager.prototype.stop = function (callback) {
    this._provider.stop(callback);
};

/**
 * Get cached value
 * @method get
 * @param key {String}
 * @param callback {Function}
 */
CacheManager.prototype.get = function (key, callback) {
    if (!isValidKey(key)) {
        this.emit('error', new Error('cacheManager.get() requires a key string'));
    }

    if (!isValidFunction(callback)) {
        this.emit('error', new Error('cacheManager.get() requires callback function'));
    }

    var query = {action: 'get'};

    query.data = {key: key, meta:{}};

    this._handleCulster(query, function (result, err) {
        callback && callback(result, err);
    });
};

CacheManager.prototype.getInfo = function (callback) {
    if (!isValidFunction(callback)) {
        this.emit('error', new Error('cacheManager.getInfo() requires callback function'));
    }

    var query = {action: 'getInfo'};

    query.data = {key: 'getInfo', meta:{}};

    this._handleCulster(query, function (result, err) {
        callback && callback(result, err);
    });
};

/**
 * Set cached value
 * @method set
 * @param data {Object} Or [{Object}]
 *             .key
 *             .value
 *             .meta
 * @param callback {Function}
 */
CacheManager.prototype.set = function (data, callback) {
    var self = this;

    if (!Array.isArray(data)) {
        data = [data];
    }

    data.forEach(function (queryObj) {
        if (!isValidKey(queryObj.key)) {
            self.emit('error', new Error('cacheManager.set() requires a "{key:key, value:value}" object or "[{key:key, value:value}]" array'));
        }

        if (!isValidValue(queryObj.value)) {
            self.emit('error', new Error('cacheManager.set() requires a "{key:key, value:value}" object or "[{key:key, value:value}]" array'));
        }
    });

    data = data.map(function (queryObj) {
        if (!queryObj.meta) {
            queryObj.meta = {};
        }

        return queryObj;
    });

    var query = {action: 'set'};

    query.data = data;

    this._handleCulster(query, function (result, err) {
        callback && callback(result, err);
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
        this.emit('error', new Error('cacheManager.delete() requires a key string'));
    }

    var query = {action: 'delete'};

    query.data = {key: key, meta:{}};

    this._handleCulster(query, function (result, err) {
        callback && callback(result, err);
    });
};


/**
 * Clear all cached values
 * @method clear
 * @param callback {Function}
 */
CacheManager.prototype.clear = function (callback) {

    var query = {action: 'clear'};

    query.data = {};

    this._handleCulster(query, function (result, err) {
        callback && callback(result, err);
    });
};

/**
 * Call the middleware
 * @method use
 * @param middleware {Object}
 */
CacheManager.prototype.use = function use(middleware) {
    if (!isValidObject(middleware)) {
        this.emit('error', new Error('cacheManager.use() requires middleware object'));
    }

    this._middlewareListBefore.push(middleware);
    this._middlewareListAfter = [middleware].concat(this._middlewareListAfter);
};

/**
 * handle cluster
 * @method _handleCulster
 * @param query {Object}
 *              .action{String}             当前的处理逻辑（eg:get）
 *              .stage {String}             当前的处理逻辑阶段（eg:get前）
 *              .data  {Object}             缓存数据对象
 *                  .key   {String}         缓存数据的key
 *                  .value {String/Object}  缓存数据的value
 *                  .meta  {Object}         缓存数据的其它信息
 * @param callback {Function}
 */
CacheManager.prototype._handleCulster = function _handleCulster(query, callback) {
    var self = this;
    var cluster = this._cluster;

    if (cluster) {
        if (cluster.isMaster) {
            self._handle(query, callback);
            cluster.on('message',function (msg, callback) {
                self._handle(msg, callback);
            });
        } else if (cluster.isWorker) {
            process.send(query, callback);
        }
    } else {
        self._handle(query, callback);
    }
};

/**
 * handle middlewares and get data from providers
 * @method handle
 * @param query {Object}
 *              .action{String}             当前的处理逻辑（eg:get）
 *              .stage {String}             当前的处理逻辑阶段（eg:get前）
 *              .data  {Object}             缓存数据对象
 *                  .key   {String}         缓存数据的key
 *                  .value {String/Object}  缓存数据的value
 *                  .meta  {Object}         缓存数据的其它信息
 * @param callback {Function}
 */
CacheManager.prototype._handle = function (query, callback) {
    var self = this;

    //处理provider前
    var beforeMiddlewareList = self._handleMiddleware('before', query);

    //处理provider
    var handleProvider = [
        function (callback) {
            self._handleProvider(query, callback);
        }
    ];

    //处理provider后
    var afterMiddlewareList = self._handleMiddleware('after', query);

    var handleList = beforeMiddlewareList.concat(handleProvider).concat(afterMiddlewareList);
    async.series(handleList, function(err){
        callback(query.data, err);
    });
};

/**
 * handle middlewares
 * @method _handleMiddleware
 * @param query {Object}
 *              .action{String}             当前的处理逻辑（eg:get）
 *              .stage {String}             当前的处理逻辑阶段（eg:get前）
 *              .data  {Object}             缓存数据对象
 *                  .key   {String}         缓存数据的key
 *                  .value {String/Object}  缓存数据的value
 *                  .meta  {Object}         缓存数据的其它信息
 */
CacheManager.prototype._handleMiddleware = function (stage, query) {
    //处理前后的middleWare
    if (stage == 'before') {
        var middlewareList = this._middlewareListBefore;
    } else {
        var middlewareList = this._middlewareListAfter;
    }

    return middlewareList.map(function (middleware) {
        return function (callback) {
            query.stage = stage + query.action;
            middleware.process(query.stage, query.data, callback);
        }
    });
};

/**
 * get data from providers
 * @method _handleProvider
 * @param query {Object}
 *              .action{String}             当前的处理逻辑（eg:get）
 *              .stage {String}             当前的处理逻辑阶段（eg:get前）
 *              .data  {Object}             缓存数据对象
 *                  .key   {String}         缓存数据的key
 *                  .value {String/Object}  缓存数据的value
 *                  .meta  {Object}         缓存数据的其它信息
 * @param callback {Function}
 */
CacheManager.prototype._handleProvider = function (query, callback) {
    var action = query.action;

    if (this._provider[action]) {
        this._provider[action](query.data, function (err, providerResult) {
            if (providerResult) {
                if (Array.isArray(providerResult.success)) {
                    if (providerResult.success.length > 1) {
                        query.data = providerResult.success;
                    } else {
                        query.data = providerResult.success[0] || query.data;
                    }
                }
                callback(null);
            } else {
                callback(err);
            }
        })
    } else {
        throw new TypeError('provider can not support "' + query.action + '"' );
    }
};

/**
 * @Function isValidKey
 * @param str {String}
 */
function isValidKey(str) {
    return (str && (Object.prototype.toString.call(str) == "[object String]" || Object.prototype.toString.call(str) == "[object Array]"));
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
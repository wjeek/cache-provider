var async = require('async');
var DefaultCacheProvider = require('./providers/simple/MemoryCacheProvider');

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

    if (!isValidFunction(callback)) {
        throw new TypeError('app.set() requires callback function');
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
    var data = {};
    Object.keys(query).forEach(function (key) {
        data[key] = query[key];
    });

    self._handleMiddleware('before', data, callback);
    self._handleProvider(data, callback);
    self._handleMiddleware('after', data, callback);


    /*//处理provider前
    var beforeMiddlewareList = self._handleMiddleware('before', data);
    //处理provider
    var handleProvider = [
        function (data, callback) {
            self._handleProvider(data, callback);
        }
    ];
    //处理provider后
    var afterMiddlewareList = self._handleMiddleware('after', data);
    var handleList = beforeMiddlewareList.concat(handleProvider).concat(afterMiddlewareList);
     async.waterfall(handleList, function(err, result));
    */

    /*async.waterfall([
        function (callback) {
            self._handleMiddleware('before', data, callback);
        },
        function (data, callback) {
            self._handleProvider(data, callback);
        },
        function (data, callback) {
            self._handleMiddleware('after', data, callback);
        }
    ], function (err, result) {
        callback(err, result);
    });*/
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
    var data = {};
    Object.keys(query).forEach(function (key) {
        data[key] = query[key];
    });

    //eg:beforeGet = 'before' + 'get'
    data.stage = stage + data.action;

    //处理前后的middleWare
    if (stage == 'before') {
        var middlewareList = this._middlewareListBefore;
    } else {
        var middlewareList = this._middlewareListAfter;
    }

    middlewareList = middlewareList.map(function (middleware) {

        return function (callback) {
            middleware.process(data, function (err) {
                callback(err, data);
            });
        }
    });
    
    async.series(middlewareList, function (err, data) {
        callback(err, data);
    })
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
    var data = {};
    Object.keys(query).forEach(function (key) {
        data[key] = query[key];
    });

    var action = data.action;

    if (this._provider[action]) {
        this._provider[action](data, function (err, cacheData) {
            if (cacheData) {
                callback(null, cacheData);
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
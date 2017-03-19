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
 * @param src {Object}
 *              .stage {String}         当前的处理逻辑阶段（如get前）
 *              .key   {String}         缓存数据的key
 *              .value {String/Object}  缓存数据的value
 *              .meta  {Object}         缓存数据的其它信息
 * @param callback {Function}
 */
CacheManager.prototype.handle = function (src, callback) {
    var self = this;

    async.waterfall([
        //处理provider前
        function (callback) {
            self._handleMiddleware('before', src, function (err, des) {
                callback(err, des);
            });
        },

        //处理provider中
        function (des, callback) {
            self._handleProvider(des, function (err, cacheData) {
                callback(err, cacheData);
            });
        },

        //处理provider后
        function (cacheData, callback) {
            self._handleMiddleware('after', cacheData, function (err, result) {
                callback(err, result);
            });
        }

    ],function (err, result) {
        callback(err, result);
    })
};

/**
 * handle middlewares
 * @method _handleMiddleware
 * @param src {Object}
 *              .stage {String}         当前的处理逻辑阶段（如get前）
 *              .key   {String}         缓存数据的key
 *              .value {String/Object}  缓存数据的value
 *              .meta  {Object}         缓存数据的其它信息
 * @param callback {Function}
 */
CacheManager.prototype._handleMiddleware = function (stage, src, callback) {

    //eg:beforeGet = 'before' + 'Get'
    src.stage = stage + src.action;

    //处理前后的middleWare
    if (stage == 'before') {
        var middlewareList = this._middlewareListBefore;
    } else {
        var middlewareList = this._middlewareListAfter;
    }

    var middlewareList = middlewareList.map(function (middleware) {

        return function (callback) {
            middleware.process(src, function (err, result) {
                callback(err, result);
            });
        }
    });

    async.waterfall(middlewareList, function (err, result) {
        callback(err, result);
    });

};

/**
 * get data from providers
 * @method _handleProvider
 * @param src {Object}
 *              .stage {String}         当前的处理逻辑阶段（如get前）
 *              .key   {String}         缓存数据的key
 *              .value {String/Object}  缓存数据的value
 *              .meta  {Object}         缓存数据的其它信息
 * @param callback {Function}
 */
CacheManager.prototype._handleProvider = function (src, callback) {
    var action = src.action;

    if (this._provider[action]) {
        this._provider[action](src, function (err, cacheData) {
            if (cacheData) {
                callback(null, cacheData);
            } else {
                callback({message:'get data from cache error.'});
            }
        })
    } else {
        throw new TypeError('provider can not support "' + src.action + '"' );
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
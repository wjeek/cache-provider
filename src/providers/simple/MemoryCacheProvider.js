var Map = require('immutable').Map;

var BaseProvider = require('../BaseProvider');
var CacheData = require('../../structs/cacheData');

/**
 * @class Cache in the Memory
 * @param options {Object}
 *        .name {string} 缓存的名称
 *        .maxLength {Integer} 最大长度
 * @constructor
 */
function MemoryCacheProvider(options) {
    if (! options) {
        options = {}
    }

    this._name = options.name || "MemoryCache";         //cache name
    this._maxLength = options.maxLength || 50;          //cache max length
    this._cache = Map();                                //cache body

    BaseProvider.apply(this, [{
        name: this._name,
        maxLength: this._maxLength
    }]);
}

/**
 * extend basic class BaseProvider
 * @type {BaseProvider}
 */
MemoryCacheProvider.prototype = new BaseProvider();
MemoryCacheProvider.prototype.constructor = MemoryCacheProvider;

/**
 * @function get Cache
 * @param cacheData {object}
 *        .key {string}
 *        .meta {object}
 *        .value {string}
 * @param callback {function}
 */
MemoryCacheProvider.prototype._getValue = function(cacheData, callback) {
    var key = cacheData.key.toString();
    if ( this._cache.has(key) ) {
        try {
            var result = this._cache.get(key);
        } catch (e) {
            console.error("MemoryCache : GET ERROR! Can't not get the cache.");
            callback && callback(e, null);
            return;
        }
        result = result.toJS();
        callback && callback(null, result);

    } else {
        console.error("MemoryCache : GET ERROR! Can't not find The cache with the keyword %s", cacheData.key);
        callback && callback(new Error("Can't not find The cache"), null);
    }
};

/**
 * @function set Cache
 * @param cacheData {object}
 *        .key {string}
 *        .meta {object}
 *        .value {string}
 * @param callback {function}
 */
MemoryCacheProvider.prototype._setValue = function (cacheData, callback) {
    try {
        var data = Map(cacheData);
        this._cache = this._cache.set(cacheData.key.toString(), data);
        callback && callback(null, cacheData);
    } catch(e) {
        callback && callback(e, cacheData);
    }
};

/**
 * delete node
 * @param dataList
 * @param callback
 */
MemoryCacheProvider.prototype._deleteValue = function (dataList, callback) {
    var self = this;
    dataList.forEach(function (cacheKey) {
        cacheKey = cacheKey.toString();
        if (self._cache.has(cacheKey)) {
            self._cache = self._cache.delete(cacheKey);
            callback && callback(null);
        } else {
            console.warn("MemoryCache : DELETE ERROR! We can't find the Cache with the keyword %s.", cacheKey);
            callback && callback(new Error());
        }
    });
};

MemoryCacheProvider.prototype._clearValue = function () {
    if (this._length) {
        this._cache = this._cache.clear();
    } else {
        console.log("MemoryCache : CLEAR WARN! The cache has been EMPTY!");
    }
};

exports = module.exports  = MemoryCacheProvider;









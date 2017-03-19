var BaseProvider = require('../BaseProvider');
var CacheData = require('../../structs/cacheData');
var Map = require('immutable').Map;

/**
 * @class Cache in the Memory
 * @param options {Object}
 *        .name {string} 缓存的名称
 *        .length {Integer} 最大长度
 * @constructor
 */
function MemoryCacheProvider(options) {
    if (! options) {
        options = {
            name: "MemoryCache",
            length: 100
        }
    }


    this._name = options.name || "MemoryCache";                //cache name
    this._maxLength = options.length || 100;                   //cache max length

    BaseProvider.apply(this, [this._maxLength]);

    this._cache = Map();                                       //cache body
    this._length = 0;                                          //current length
    this._available = true;                                    //if cache touch max length
}

/**
 * extend basic class BaseProvider
 * @type {BaseProvider}
 */
MemoryCacheProvider.prototype = new BaseProvider();

/**
 * get Cache
 * @param cacheData {object}
 *        .key {string}
 *        .meta {object}
 *        .value {string}
 * @param callback {function}
 */
MemoryCacheProvider.prototype._getValue = function(cacheData, callback) {
    if ( this._cache.has(cacheData.key) ) {
        try {
            var result = this._cache.get(cacheData.key);
        } catch (e) {
            console.error("MemoryCache : GET ERROR! Can't not get the cache.");
            callback && callback(e,null);
            return;
        }
        console.log('MemoryCache : GET SUCCESS! The cache with the keyword %s has been acquired!', cacheData.key);
        callback && callback(null, result);

    } else {
        console.error("MemoryCache : GET ERROR! Can't not find The cache with the keyword %s", cacheData.key);
        callback && callback(new Error("Can't not find The cache"), null);
    }
};

/**
 * set Cache
 * @param cacheData {object}
 * @param callback {function}
 */
MemoryCacheProvider.prototype._setValue = function (cacheData, callback) {
    if (this._available) {
        var data = new CacheData(cacheData.key, cacheData.meta, cacheData.value);
        this._cache = this._cache.set(cacheData.key, data);
        this._length ++;
        this._correct();
        console.log('MemoryCache : SET SUCCESS! Data with the keyword %s has been cached!', cacheData.key);
        callback && callback(null, cacheData);
    } else {
        console.error('MemoryCache : SET ERROR! The Cache is full.', cacheData.key);
        callback && callback(new Error("The Cache is full."), null);
    }
};

/**
 * delete node
 * @param cacheData
 * @param callback
 */
MemoryCacheProvider.prototype._deleteValue = function (cacheData, callback) {
    if (this._cache.has(cacheData.key)) {
        this._cache = this._cache.delete(cacheData.key);
        this._length --;
        this._correct();
        console.log('MemoryCache : DELETE SUCCESS! Data with the keyword %s has been DELETED!', cacheData.key);
        callback && callback(null,cacheData);
    } else {
        console.warn("MemoryCache : DELETE ERROR! We can't find the Cache with the keyword %s.", cacheData.key);
        callback && callback(null, cacheData);
    }
};

MemoryCacheProvider.prototype._clearValue = function () {
    if (this._length) {
        this._cache = this._cache.clear();
        console.log("MemoryCache : CLEAR SUCCESS! The cache has been CLEARED!");
    } else {
        console.log("MemoryCache : CLEAR WARN! The cache has been EMPTY!");
    }
};

MemoryCacheProvider.prototype._correct = function () {
    this._available = this._maxLength > this._length;
};

exports = module.exports  = MemoryCacheProvider;








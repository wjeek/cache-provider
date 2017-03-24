var BaseProvider   =   require('../BaseProvider');
var CacheData      =   require('../../structs/cacheData');
var Immutable      =   require('immutable');

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

    this._cache       =   {};
    this._length      =   0;
    this._maxLength   =   options.maxLength || 50;
    this._name        =   options.name || "MemoryCache";

    BaseProvider.apply(this, [{
        name        :   this._name,
        maxLength   :   this._maxLength
    }]);
}

/**
 * extend basic class BaseProvider
 * @type {BaseProvider}
 */
MemoryCacheProvider.prototype = new BaseProvider();
MemoryCacheProvider.prototype.constructor = MemoryCacheProvider;

/**
 * @function get single CacheData
 * @param cacheData {object}
 *        .key {string}
 *        .meta {object}
 *        .value {string}
 * @param callback {function}
 */
MemoryCacheProvider.prototype._getValue = function(cacheData, callback) {
    var cacheKey = cacheData.key + "";

    if ( this._cache[cacheKey] ) {
        try {
            /*get Map from cache & Deeply convert to Object*/
            var data = this._cache[cacheKey].toJS();
            callback && callback(null, data);
        } catch (e) {
            callback && callback(new Error(), cacheData);
        }

    } else {
        console.error("MemoryCache : GET ERROR! Can't not find The cache with the keyword %s", cacheKey);
        callback && callback(new Error(), cacheData);
    }
};

/**
 * @function get bulk CacheData
 * @param dataList {Array}
 *        .CacheData {object}
 * @param callback {function}
 */
MemoryCacheProvider.prototype._getValues = function(dataList, callback) {

    var self = this;

    var result = {
        success : [],
        failed : []
    };

    dataList.forEach(function (cacheData) {
        try {
            self._getValue(cacheData, function (err, data) {
                if (!err) {
                    result.success.push(data);
                } else {
                    result.failed.push(data);
                }
            });

        } catch (e) {
            result.failed.push(cacheData)
        }
    });

    callback && callback(null, result)

};

/**
 * @function set single Cache
 * @param cacheData {object}
 *        .key {string}
 *        .meta {object}
 *        .value {string}
 * @param callback {function}
 */
MemoryCacheProvider.prototype._setValue = function (cacheData, callback) {

    if (cacheData instanceof Object){     //cacheData should be a Object
        var cacheKey = cacheData.key + "";
        var data = {
            key    :  cacheData.key,
            meta   :  cacheData.meta,
            value  :  cacheData.value
        };

        /*The data must be converted to Immutable Map in depth*/
        this._cache[cacheKey] = Immutable.fromJS(data);

        this._length ++;

        callback && callback(null, data);
    } else {
        callback && callback(new Error(), cacheData);
    }
};

/**
 * @function set bulk Cache
 * @param dataList {Array}
 *        .CacheData {object}
 * @param callback {function}
 */
MemoryCacheProvider.prototype._setValues = function (dataList, callback) {

    var self = this;

    var result = {
        success : [],
        failed : []
    };

    dataList.forEach(function (cacheData) {
        try {
            self._setValue(cacheData, function (err, cacheData) {
                if (!err) {
                    result.success.push(cacheData);
                } else {
                    result.failed.push(cacheData);
                }
            });
        } catch (e) {
            result.failed.push(cacheData);
        }
    });

    callback && callback(null, result)
};

/**
 * delete single node
 * @param cacheData {Array} The keys should be delete
 * @param callback {function}
 */
MemoryCacheProvider.prototype._deleteValue = function (cacheData, callback) {
    //TODO : single delete
};

/**
 * delete nodes
 * @param dataList {Array} The keys should be delete
 * @param callback {function}
 */
MemoryCacheProvider.prototype._deleteValues = function (dataList, callback) {

    var self = this;

    var result = {
        success : [],
        failed   : []
    };

    if (Array.isArray(dataList)) {

        dataList.forEach(function (cacheData) {
            const key = cacheData.key + "";
            if (self._cache[key]) {
                try {
                    delete self._cache[key];
                    self._length --;
                    result.success.push(cacheData);
                } catch(e) {
                    result.failed.push(cacheData);
                }
            } else {
                result.failed.push(cacheData);
                console.warn("MemoryCache : DELETE ERROR! We can't find the Cache with the keyword %s.", cacheData.key);
            }
        });

        callback && callback(null, result);
    }
};

MemoryCacheProvider.prototype._clearValue = function () {
    if (this._length) {
        this._cache = {};
    } else {
        console.log("MemoryCache : CLEAR WARN! The cache has been EMPTY!");
    }
};

exports = module.exports  = MemoryCacheProvider;






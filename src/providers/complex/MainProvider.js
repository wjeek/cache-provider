var BaseProvider = require('../BaseProvider');
var MemoryCacheProvider = require('../simple/MemoryCacheProvider');
var FileCacheProvider = require('../simple/FileCacheProvider');
var CacheData = require('../../structs/CacheData');
var async = require('async');

function MainProvider(providers) {

    /**
     * providers that MainProvider will use
     * @type {Array}
     */
    this._providers = [];

    var self = this;
    providers.forEach(function(provider){
        var pro_class = provider.provider;
        var opt = provider.options;
        var pro = pro_class instanceof Function ? new pro_class(opt) : {};
        if (pro instanceof BaseProvider) {
            self._providers.push(pro)
        } else {
            console.error('please use the instance of BaseProvider...')
        }
    })

}

MainProvider.prototype = new BaseProvider();
MainProvider.prototype.constructor = MainProvider;

/*
MainProvider.prototype.link = function(){
    for(var i in arguments){
        var provider = arguments[i] instanceof Function ? new arguments[i]() : {};

        if (provider instanceof BaseProvider) {
            this._providers.push(provider)
        } else {
            console.error('please use the instance of BaseProvider...')
        }
    }
};
*/

/**
 * get value from provider
 * @param cacheData {Object}
 * @param callback {Function}
 */
MainProvider.prototype.get = function(cacheData, callback){
    var provider_func = this._providers.map(function(provider, index){
        if (index == 0){
            return function(callback){
                provider.get(cacheData, function(error, result){
                    callback(null, error, result);
                })
            }
        } else {
            return function (error, result, callback) {
                if (!error && result instanceof CacheData && result.value.length > 0) {
                    callback(null, error, result);
                } else {
                    provider.get(cacheData, function (error, result) {
                        callback(null, error, result);
                    })
                }
            }
        }
    });

    async.waterfall(provider_func, function (err, error, result){
        if (!err){
            callback(error, result);
        }
    });
};

/**
 * set value to provider
 * @param cacheData {Object}
 * @param callback {Function}
 */
MainProvider.prototype.set = function(cacheData, callback){
    if (this._providers.length > 0){
        try {
            async.parallel(this._providers.map(function(provider){
                return function(callback){
                    provider.set(cacheData, function(err){
                        callback(null, true);
                    });
                }
            }), function(err, result){
                if(!err)
                    callback(null, result);
            })
        } catch(error) {
            console.error('set cachedata error');
        }
    } else {
        callback(new Error('there is no provider'))
    }
};

/**
 * protect method to delete value from provider
 * @param cacheData {Object}
 * @param callback {Function}
 * @private
 */
MainProvider.prototype._deleteValue = function(cacheData, callback){
    try {
        async.parallel(this._providers.map(function(provider){
            return function(callback){
                provider.delete(cacheData, function(err){
                    callback(null);
                });
            }
        }), function(err, result){
            if(!err)
                callback(null, true);
        })
    } catch(error) {
        console.error('delete cachedata error');
    }
};

/**
 * protect method to start provider
 * @private
 */
MainProvider.prototype._startProvider = function(){
    try {
        this._providers.forEach(function(provider){
            provider.start();
        })
    } catch(error) {
        console.error('start providers error');
    }
};

/**
 * protect method to stop provider
 * @private
 */
MainProvider.prototype._stopProvider = function(){
    try {
        this._providers.forEach(function(provider){
            provider.stop();
        })
    } catch(error) {
        console.error('stop providers error');
    }
};

exports = module.exports  = MainProvider;
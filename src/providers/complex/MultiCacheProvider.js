var BaseProvider = require('../BaseProvider');
var MemoryCacheProvider = require('../simple/MemoryCacheProvider');
var CacheData = require('../../structs/CacheData');
var async = require('async');

/**
 * create MultiCacheProvider
 * @param options {Object}
 *          .providers {Array}
 * @constructor
 */
function MultiCacheProvider(options) {

    /**
     * providers that MainProvider will use
     * @type {Array}
     */

    if (options){
        this._providers = options.providers;
    } else {
        this._providers = [
            new MemoryCacheProvider()
        ]
    }

    // var self = this;
    // if (providers && providers.length > 0){
    //     this._providers = [];
    //     providers.forEach(function(provider){
    //         var pro_class = provider.provider;
    //         var opt = provider.options;
    //         var pro = pro_class instanceof Function ? new pro_class(opt) : {};
    //         if (pro instanceof BaseProvider) {
    //             self._providers.push(pro)
    //         } else {
    //             console.error('please use the instance of BaseProvider...')
    //         }
    //     })
    // }

}

MultiCacheProvider.prototype = Object.create(BaseProvider.prototype);
MultiCacheProvider.prototype.constructor = MultiCacheProvider;

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
MultiCacheProvider.prototype.get = function(cacheData, callback){
    var self = this;
    var provider_func = this._providers.map(function(provider, index){
        if (index == 0){
            return function(callback){
                provider.get(cacheData, function(error, result){
                    callback && callback(null, error, result);
                })
            }
        } else {
            return function (error, result, callback) {
                if (!error && result.failed[0].key.length <= 0) {
                    callback && callback(null, error, result);
                } else {
                    provider.get(result.failed[0], function (error, result2) {
                        if (result2.success && result2.success.length > 0){
                            self.set(result2.success, function(err, set_result){
                                console.log('write back to prior cache');
                            });
                        }

                        var new_result = {
                            success: result2.success.concat(result.success),
                            failed: result2.failed
                        };
                        callback && callback(null, error, new_result);
                    })
                }
            }
        }
    });

    async.waterfall(provider_func, function (err, error, result){
        if (!err){
            callback && callback(error, result);
        }
    });
};

/**
 * set value to provider
 * @param cacheData {Object}
 * @param callback {Function}
 */
MultiCacheProvider.prototype.set = function(cacheData, callback){
    if (this._providers.length > 0){
        try {
            async.parallel(this._providers.map(function(provider){
                return function(callback){
                    provider.set(cacheData, function(err){
                        callback && callback(null, true);
                    });
                }
            }), function(err, result){
                if(!err)
                    callback && callback(null, result);
            })
        } catch(error) {
            console.error('set cachedata error');
        }
    } else {
        callback && callback(new Error('there is no provider'))
    }
};

/**
 * protect method to delete value from provider
 * @param cacheData {Object}
 * @param callback {Function}
 * @private
 */
MultiCacheProvider.prototype._deleteValue = function(cacheData, callback){
    try {
        async.parallel(this._providers.map(function(provider){
            return function(callback){
                provider.delete(cacheData, function(err){
                    callback && callback(null);
                });
            }
        }), function(err, result){
            if(!err)
                callback && callback(null, true);
        })
    } catch(error) {
        console.error('delete cachedata error');
    }
};

/**
 * protect method to start provider
 * @private
 */
MultiCacheProvider.prototype._startProvider = function(){
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
MultiCacheProvider.prototype._stopProvider = function(){
    try {
        this._providers.forEach(function(provider){
            provider.stop();
        })
    } catch(error) {
        console.error('stop providers error');
    }
};

/**
 * protect method to load cache list
 * @private
 */
MultiCacheProvider.prototype.load = function(callback){
    try {
        this._providers.forEach(function(provider){
            provider.load(callback);
        })
    } catch(error) {
        console.error('load providers error');
    }
};

/**
 * protect method to save cache list
 * @private
 */
MultiCacheProvider.prototype.save = function(callback){
    try {
        this._providers.forEach(function(provider){
            provider.save(callback);
        })
    } catch(error) {
        console.error('save providers error');
    }
};

exports = module.exports  = MultiCacheProvider;
/**
 * Created by hickey_cao on 2017/3/21.
 */
var app = require('../../src/index');
var async = require('async');
var cluster = require('cluster');

var memProvider = new app.providers.MemoryCacheProvider();
var fileProvider = new app.providers.FileCacheProvider();
var redisProvider = new app.providers.RedisCacheProvider({
    port: 6379,
    host: '120.27.199.181'
});
var multiProvider = new app.providers.MultiCacheProvider([{provider:app.providers.FileCacheProvider}]);
var cacheManager = new app.CacheManager({provider:fileProvider});

var validation = new app.middlewares.Validation();
var hash = new app.middlewares.Hash();
var compression = new app.middlewares.Compression();
var logger = new app.middlewares.Logger();

cacheManager.use(validation);
cacheManager.use(hash);
//cacheManager.use(compression);
cacheManager.use(logger);

async.waterfall(
    [
        function (callback) {
            cacheManager.set({key:'test1',value:'123'}, function (result, err) {
                if (err) {
                    console.error('set test1:' + err.message);
                    callback(null);
                } else {
                    console.log('set test1:' + JSON.stringify(result));
                    callback(err);
                }
            });
        },
        function (callback) {
            cacheManager.get('test1', function (result, err) {
                if (err) {
                    console.error('get test1:' + err.message);
                    callback(null);
                } else {
                    console.log('get test1:' + JSON.stringify(result));
                    callback(err);
                }
            });
        },
        function (callback) {
            cacheManager.set({key:'test2',value:{a:1}}, function (result, err) {
                if (err) {
                    console.error('set test2:' + err.message);
                    callback(null);
                } else {
                    console.log('set test2:' + JSON.stringify(result));
                    callback(err);
                }
            });
        },
        function (callback) {
            cacheManager.get(['test1','test2'], function (result, err) {
                if (err) {
                    console.error('get test2:' + err.message);
                    callback(null);
                } else {
                    console.log('get test2:' + JSON.stringify(result));
                    callback(err);
                }
            });
        },
        function (callback) {
            cacheManager.delete('test1', function (result, err) {
                if (err) {
                    console.error('delete test1:' + err.message);
                    callback(null);
                } else {
                    console.log('delete test1:' + JSON.stringify(result));
                    callback(err);
                }
            });
        },
        function (callback) {
            cacheManager.delete(['test1', 'test2'], function (result, err) {
                if (err) {
                    console.error('delete [test1, test2]:' + err.message);
                    callback(null);
                } else {
                    console.log('delete [test1, test2]:' + JSON.stringify(result));
                    callback(err);
                }
            });
        },
        function (callback) {
            /*cacheManager.clear(function (result, err) {
                if (err) {
                    console.error('clear:' + err.message);
                    callback(null);
                } else {
                    console.log('clear:' + JSON.stringify(result));
                    callback(err);
                }
            });*/
        },
    ]
);

// var maxCount = 10;
// for (var i = 0; i< maxCount; i++) {
//     cacheManager.emit('addTask', test);
// }
//
// function test() {
//     console.log('111')
// }

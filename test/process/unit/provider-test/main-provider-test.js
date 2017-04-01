var MultiCacheProvider = require('../../../../src/providers/complex/MultiCacheProvider');
var MemoryCacheProvider = require('../../../../src/providers/simple/MemoryCacheProvider');
var RedisCacheProvider = require('../../../../src/providers/simple/RedisCacheProvider');
var FileCacheProvider = require('../../../../src/providers/simple/FileCacheProvider');
var CacheData = require('../../../../src/structs/CacheData');

var MemoryCache = new MemoryCacheProvider({});

var RedisCache = new RedisCacheProvider({
    port: 6379,
    host: '120.27.199.181'
});
var a = new MultiCacheProvider({
    providers: [MemoryCache, RedisCache]
});

for (var i = 0; i < 50; i++) {
    const index = i;
    var data = {key: 'data' + index, meta: {}, value:{abc: index}};
    a.set([data], function (err) {
        if (!err) {
            console.log('successful: data' + index);
        } else {
            console.error(err);
        }
    });
}

for (i = 50; i < 60; i++) {
    const index = i;
    data = {key: 'data' + index, meta: {}, value:{abc: index}};
    a.set([data], function (err) {
        if (!err) {
            console.log('successful: data' + index);
        } else {
            console.error(err);
        }
    });
}

console.log(a._providers);

setTimeout(
    function () {
        //for(var i=0; i<10; i++) {
            a.get({key: "data1"}, function (err, cachaData) {
                if (!err) {
                    console.log(cachaData);
                } else {
                    console.error(err);
                }
            });
        //}
    }, 2000
);

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

a.set([{key: 'dataHaha', meta: {'expire': 100}, value:{abc: index}}], function (err) {

});

for (var i = 1; i < 98; i++) {
    var index = i;
    var data = {key: 'data' + index, meta: {}, value:{abc: index}};
    a.set([data], function (err) {
        if (!err) {
            console.log('successful: data' + index);
        } else {
            console.error(err);
        }
    });
}

a.set([{key: 'dataHaha1', meta: {'expire': 100}, value:{abc: index}}], function (err) {

});

a.set([{key: 'dataHaha2', meta: {'expire': 1000000000,'count': 1}, value:{abc: index}}], function (err) {

});

console.log(a._providers);

a._providers[0]._deleteValues([{key: 'data30'}],function(){
    console.log(a._providers[0]);
    a._providers[0]._queue.delete({key: 'data30'});
    console.log(a._providers[0]);
})

a.get({key: "data30"}, function (err, cachaData) {
    if (!err) {
        console.log(cachaData);
    } else {
        console.error(err);
    }
});


a.set([{key: 'data101', meta: {}, value:{abc: index}}], function (err) {
    if (!err) {
        console.log('successful: data' + index);
    } else {
        console.error(err);
    }
});

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
    }, 1000
);

setTimeout(
    function () {
        //for(var i=0; i<10; i++) {

        a.delete({key: "data1"}, function (err, result) {
            if (!err) {
                console.log(result);
            } else {
                console.error(err);
            }
        });


        //}
    }, 2000
);

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
    }, 3000
);



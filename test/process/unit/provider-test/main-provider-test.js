var MultiCacheProvider = require('../../../../src/providers/complex/MultiCacheProvider');
var MemoryCacheProvider = require('../../../../src/providers/simple/MemoryCacheProvider');
//var RedisCacheProvider = require('../../../../src/providers/simple/RedisCacheProvider');
var FileCacheProvider = require('../../../../src/providers/simple/FileCacheProvider');


// var RedisCache = new RedisCacheProvider({
//     port: 6379,
//     host: '120.27.199.181'
// });

var MemoryCache = new MemoryCacheProvider();
var a = new MultiCacheProvider({
    providers: [MemoryCache]
});

for (var i = 0; i < 47; i++) {
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
console.log(a._providers);

a.set([{key: 'key60',value:111},
    {key: 'key61',value:111},
    {key: 'key62',value:111},
    {key: 'key63',value:111}], function (err) {
    if (!err) {
        console.log('successful: data' + index);
    } else {
        console.error(err);
    }
});




a.get({key: ['data1', 'data0', 'data99', 'data98']}, function (err, cachaData) {
    if (!err) {
        console.log(cachaData);
    } else {
        console.error(err);
    }
});

a._deleteValue({key: ['data1', 'data0', 'data99', 'data98']}, function (err, cachaData) {
    if (!err) {
        console.log(cachaData);
    } else {
        console.error(err);
    }
});
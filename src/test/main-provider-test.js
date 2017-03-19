var MainProvider = require('../providers/complex/MainProvider');
var MemoryCacheProvider = require('../providers/simple/MemoryCacheProvider');
var RedisCacheProvider = require('../providers/simple/RedisCacheProvider');
var FileCacheProvider = require('../providers/simple/FileCacheProvider');
var CacheData = require('../structs/CacheData');

var a = new MainProvider([
    {
        provider: MemoryCacheProvider,
        options: {}
    },
    {
        provider: FileCacheProvider,
        options: {}
    }
]);

console.log(a._providers);
var data = new CacheData('haha', {}, '123456');
console.log(data);


a.set(data, function(err){
    if (!err) {
        a.get(data, function (err, cachaData) {
            if (!err){
                console.log(cachaData);
            }else{
                console.error(err);
            }
        });
    }
});


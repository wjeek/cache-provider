var MainProvider = require('../../../../src/providers/complex/MainProvider');
var MemoryCacheProvider = require('../../../../src/providers/simple/MemoryCacheProvider');
var RedisCacheProvider = require('../../../../src/providers/simple/RedisCacheProvider');
var FileCacheProvider = require('../../../../src/providers/simple/FileCacheProvider');
var CacheData = require('../../../../src/structs/CacheData');

var a = new MainProvider([
    {
        provider: MemoryCacheProvider,
        options: {}
    },
    {
        provider: RedisCacheProvider,
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


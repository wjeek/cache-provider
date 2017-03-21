var MultiCacheProvider = require('../../../../src/providers/complex/MultiCacheProvider');
var MemoryCacheProvider = require('../../../../src/providers/simple/MemoryCacheProvider');
var RedisCacheProvider = require('../../../../src/providers/simple/RedisCacheProvider');
var FileCacheProvider = require('../../../../src/providers/simple/FileCacheProvider');
var CacheData = require('../../../../src/structs/CacheData');

var a = new MultiCacheProvider([
    {
        provider: MemoryCacheProvider,
        options: {}
    },
    // {
    //     provider: RedisCacheProvider,
    //     options: {}
    // },
    // {
    //     provider: FileCacheProvider,
    //     options: {}
    // }
]);

console.log(a._providers);

for(var i=0; i<99; i++){
    console.log('data: ' + i);
    for(var j=0; j<99-i; j++){
        var index = i;
        var data = new CacheData('data'+index, {}, '123456');
        a.set(data, function(err){
            if (!err) {
                console.log('successful: data'+index)
            }else{
                console.err('set error');
            }
        });
    }
}
console.log(a._providers[0]._queue.print());

setTimeout(
    function(){
    a.get(new CacheData('data0'), function (err, cachaData) {
        if (!err){
            console.log(cachaData);
        }else{
            console.error(err);
        }
    })}, 5000
);

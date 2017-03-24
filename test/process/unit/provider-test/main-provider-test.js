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
    //     provider: FileCacheProvider,
    //     options: {}
    // }
]);

for (var i = 0; i < 4; i++) {
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
console.log(a);

a.set([{key:'data5',value:'a'},
	{key:'data6',value:'a'},
	{key:'data7',value:'a'},
	{key:'data8',value:'a'}
        ], function (err) {
    if (!err) {
        console.log('successful: data' + index);
    } else {
        console.error(err);
    }
});

for (i = 50; i < 60; i++) {
    var index = i;
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
            a.get({key: ['data60', 'data0']}, function (err, cachaData) {
                if (!err) {
                    console.log(cachaData);
                } else {
                    console.error(err);
                }
            });
        //}
    }, 2000
);

var assert = require('assert');

var CacheData = require('./index').CacheData ;

describe('CacheData [数据结构 - 缓存数据]', function() {
    describe('CacheData [属性检测]',function(){
        var cacheData = new CacheData('foo',{},'bar');
        [
            'key' ,
            'meta' ,
            'value'
        ].forEach(function(attr){
            it( '[ ' + attr + ']' , function(){
                assert.ok( typeof cacheData[attr] !== 'undefined' );
            });
        }) ;
    });
});

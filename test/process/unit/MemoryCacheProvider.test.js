var assert = require('assert');

var MemoryCacheProvider = require('./index').MemoryCacheProvider ;
var CacheData = require('./index').CacheData ;

describe('MemoryCacheProvider [Provider - 内存]', function() {
    describe('MemoryCacheProvider [属性检测]',function(){
        var memoryCacheProvider = new MemoryCacheProvider();
        [
            '_cache' ,
            '_maxLength' ,
            '_name'
        ].forEach(function(attr){
            it( '[ ' + attr + ']' , function(){
                assert.ok( typeof memoryCacheProvider[attr] !== 'undefined' );
            });
        }) ;
    });
    describe('MemoryCacheProvider [原型检测]',function(){
        var memoryCacheProvider = new MemoryCacheProvider();
        [
            '_getValue' ,
            '_setValue' ,
            '_deleteValue' ,
            '_clearValue'
        ].forEach(function(pro){
            var instanceRet =  ( typeof memoryCacheProvider[ pro ] !== 'undefined' && typeof memoryCacheProvider[pro] === 'function') ;
            var consRet = ( typeof MemoryCacheProvider[pro] === 'undefined' && typeof MemoryCacheProvider.prototype[pro] === 'function' ) ;
            it( '[ ' + pro + ']' , function(){
                assert.ok( instanceRet && consRet ) ;
            });
        }) ;
    });
    describe('MemoryCacheProvider.prototype._setValue [Function]',function(){
        it( '_setValue' ,function () {
            var memoryCacheProvider = new MemoryCacheProvider();
            var cacheData = new CacheData('foo',{

            },'bar');
            memoryCacheProvider._setValue(cacheData,function(err,data){
                assert.ok( !err && data.value === 'bar' ) ;
            });
        }) ;
    });
    describe('MemoryCacheProvider.prototype._getValue [Function]',function(){
        it( '_getValue' ,function () {
            var memoryCacheProvider = new MemoryCacheProvider();
            var cacheData = new CacheData('foo',{

            },'bar');
            memoryCacheProvider._setValue(cacheData,function(err,data){
                memoryCacheProvider._getValue(cacheData,function(err,data){
                    assert.ok( !err && data.value === 'bar' ) ;
                });
            });
        });
    });
    describe('MemoryCacheProvider.prototype._setValues [Function]',function(){
        it( '_setValues' ,function () {
            var memoryCacheProvider = new MemoryCacheProvider();
            var cacheData = new CacheData('foo',{

            },'bar');
            memoryCacheProvider._setValues([
                new CacheData('foo',{

                },'fooValue') ,
                new CacheData('bar',{

                },'barValue')
            ],function(err,result){
                assert.ok( result.success.length == 2 && result.failed.length == 0 ) ; ;
            });
        });
    });
    describe('MemoryCacheProvider.prototype._getValues [Function]',function(){
        it('_getValues',function(){
            var memoryCacheProvider = new MemoryCacheProvider();
            var cacheData1 = new CacheData('foo',{

            },'fooValue');
            var cacheData2 = new CacheData('bar',{

            },'barValue')
            memoryCacheProvider._setValues([
                cacheData1 ,
                cacheData2
            ],function(err,result){
                memoryCacheProvider._getValues([
                    cacheData1 ,
                    cacheData2
                ],function(err,result){
                    assert.ok( !err && result.success.length == 2 && result.failed.length == 0 ) ;
                });
            });
        });
    });
    describe('MemoryCacheProvider.prototype._deleteValues [Function]',function(){
        it('_deleteValues',function(){
            var memoryCacheProvider = new MemoryCacheProvider();
            var cacheData1 = new CacheData('foo',{

            },'fooValue');
            var cacheData2 = new CacheData('bar',{

            },'barValue')
            memoryCacheProvider._setValues([
                cacheData1 ,
                cacheData2
            ],function(err,result){
                memoryCacheProvider._getValues([
                    cacheData1 ,
                    cacheData2
                ],function(err,result){
                    var getStep1 = ( !err && result.success.length == 2 && result.failed.length == 0 ) ;

                    memoryCacheProvider._deleteValues([
                        cacheData1
                    ],function(err,result){
                        var delectStep2 = ( !err && result.success.length == 1 && result.failed.length == 0 ) ;

                        var count = 0 ;
                        for (var _o in memoryCacheProvider._cache ){
                            if ( memoryCacheProvider._cache.hasOwnProperty(_o) ){
                                count++ ;
                            }
                        }

                        assert.ok( getStep1 && delectStep2 && count == 1 ) ;

                    });

                });
            });
        });
    });
    describe('MemoryCacheProvider.prototype._clearValue [Function]',function(){
        it('_clearValue',function(){
            var memoryCacheProvider = new MemoryCacheProvider();
            var cacheData1 = new CacheData('foo',{

            },'fooValue');
            var cacheData2 = new CacheData('bar',{

            },'barValue')
            memoryCacheProvider._setValues([
                cacheData1 ,
                cacheData2
            ],function(err,result){
                var count = 0 ;
                for (var _o in memoryCacheProvider._cache ){
                    if ( memoryCacheProvider._cache.hasOwnProperty(_o) ){
                        count++ ;
                    }
                }
                memoryCacheProvider._clearValue();

                var countAfter = 0 ;
                for (var _o in memoryCacheProvider._cache ){
                    if ( memoryCacheProvider._cache.hasOwnProperty(_o) ){
                        countAfter++ ;
                    }
                }

                assert.ok( count == 2 && countAfter == 0 ) ;
            });
        });
    });
});

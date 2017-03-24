var assert = require('assert');

var RedisCacheProvider = require('./index').RedisCacheProvider ;
var CacheData = require('./index').CacheData ;

describe('RedisCacheProvider [Provider - Redis]', function() {
    describe('RedisCacheProvider [属性检测]',function(){
        var redisCacheProvider = new RedisCacheProvider();
        [
            '_name' ,
            '_maxLength' ,
            '__client'
        ].forEach(function(attr){
            it( '[ ' + attr + ']' , function(){
                assert.ok( typeof redisCacheProvider[attr] !== 'undefined' );
            });
        }) ;
    });
    describe('RedisCacheProvider [原型检测]',function(){
        var redisCacheProvider = new RedisCacheProvider();
        [
            '_getValues' ,
            '_setValues' ,
            '_deleteValues' ,
            '_load' ,
            '_save' ,
            '_setExpirationTime' ,
            '__getValue' ,
            '__setValue' ,
            '_deleteValue' ,
            '__setExpirationTime'
        ].forEach(function(pro){
            var instanceRet =  ( typeof redisCacheProvider[ pro ] !== 'undefined' && typeof redisCacheProvider[pro] === 'function') ;
            var consRet = ( typeof RedisCacheProvider[pro] === 'undefined' && typeof RedisCacheProvider.prototype[pro] === 'function' ) ;
            it( '[ ' + pro + ']' , function(){
                assert.ok( instanceRet && consRet ) ;
            });
        }) ;
    });
    // describe('FileCacheProvider.prototype._setValue [Function]',function(){
    //     it('_setValue',function(done){
    //         var fileCacheProvider = new FileCacheProvider();
    //         fileCacheProvider._setValue(new CacheData('foo',{
    //
    //         },'fooValue'),function(err,result){
    //             assert.ok( !err && result.value == 'fooValue' ) ;
    //             done() ;
    //         });
    //     });
    // });
    // describe('FileCacheProvider.prototype._getValue [Function]',function(){
    //     it('_getValue',function(done){
    //         var fileCacheProvider = new FileCacheProvider();
    //         var cacheData = new CacheData('foo',{
    //
    //         },'fooValue');
    //         fileCacheProvider._setValue(cacheData,function(err,result){
    //             fileCacheProvider._getValue( cacheData ,function(err,result){
    //                 assert.ok( !err && result.value=='fooValue' ) ;
    //                 done() ;
    //             });
    //         });
    //     });
    // });
    // describe('FileCacheProvider.prototype._setValues [Function]',function(){
    //     it('_setValues',function(done){
    //         var fileCacheProvider = new FileCacheProvider();
    //         var cacheData1 = new CacheData('foo',{
    //
    //         },'fooValue');
    //         var cacheData2 = new CacheData('bar',{
    //
    //         },'barValue')
    //         fileCacheProvider._setValues([
    //             cacheData1 ,
    //             cacheData2
    //         ],function(err,result){
    //             assert.ok( !err ) ;
    //             done() ;
    //         });
    //     });
    // });
    // describe('FileCacheProvider.prototype._getValues [Function]',function(){
    //     it('_getValues',function(done){
    //         var fileCacheProvider = new FileCacheProvider();
    //         var cacheData1 = new CacheData('foo',{
    //
    //         },'fooValue');
    //         var cacheData2 = new CacheData('bar',{
    //
    //         },'barValue')
    //         fileCacheProvider._setValues([
    //             cacheData1 ,
    //             cacheData2
    //         ],function(err,result){
    //             fileCacheProvider._getValues([
    //                 cacheData1 ,
    //                 cacheData2
    //             ],function(err,result){
    //                 assert.ok( !err && result.success.length == 2 && result.failed.length == 0 ) ;
    //                 done() ;
    //             });
    //         });
    //     });
    // });
    // describe('FileCacheProvider.prototype._deleteValue [Function]',function(){
    //     it('_deleteValue',function(done){
    //         var fileCacheProvider = new FileCacheProvider();
    //         var cacheData1 = new CacheData('foo',{
    //
    //         },'fooValue');
    //         var cacheData2 = new CacheData('bar',{
    //
    //         },'barValue');
    //         fileCacheProvider._setValues([
    //             cacheData1 ,
    //             cacheData2
    //         ],function(err,result){
    //
    //             var ret1 = !err && result.success.length == 2 ;
    //             fileCacheProvider._deleteValue(cacheData1,function(err,result){
    //
    //                 fileCacheProvider._getValue(cacheData1,function(err,result){
    //
    //                     assert.ok( err && err.errno == -2 ) ;
    //                     done() ;
    //                 });
    //
    //             }) ;
    //         });
    //     });
    // });
    // describe('FileCacheProvider.prototype._deleteValues [Function]',function(){
    //     it('_deleteValues',function(done){
    //         var fileCacheProvider = new FileCacheProvider();
    //         var cacheData1 = new CacheData('foo',{
    //
    //         },'fooValue');
    //         var cacheData2 = new CacheData('bar',{
    //
    //         },'barValue')
    //         fileCacheProvider._setValues([
    //             cacheData1 ,
    //             cacheData2
    //         ],function(err,result){
    //             fileCacheProvider._getValues([
    //                 cacheData1 ,
    //                 cacheData2
    //             ],function(err,result){
    //                 var getStep1 = ( !err && result.success.length == 2 && result.failed.length == 0 ) ;
    //
    //                 fileCacheProvider._deleteValues([
    //                     cacheData1
    //                 ],function(err,result){
    //                     var deleteStep2 = ( !err && result.success.length == 1 && result.failed.length == 0 ) ;
    //
    //                     fileCacheProvider._getValue(cacheData2,function(err,result){
    //
    //                         var deleteRet1 = !err ;
    //
    //                         fileCacheProvider._getValue(cacheData1,function(err,result){
    //
    //                             assert.ok( err && err.errno == -2 ) ;
    //                             done() ;
    //                         });
    //
    //                     });
    //
    //                 });
    //             });
    //         });
    //     });
    // });
});

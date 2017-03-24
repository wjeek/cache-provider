var assert = require('assert');

var FileCacheProvider = require('./index').FileCacheProvider ;
var CacheData = require('./index').CacheData ;

describe('FileCacheProvider [Provider - 文件]', function() {
    describe('FileCacheProvider [属性检测]',function(){
        var fileCacheProvider = new FileCacheProvider();
        [
            '_name' ,
            '_path' ,
            '_length'
        ].forEach(function(attr){
            it( '[ ' + attr + ']' , function(){
                assert.ok( typeof fileCacheProvider[attr] !== 'undefined' );
            });
        }) ;
    });
    describe('FileCacheProvider [原型检测]',function(){
        var fileCacheProvider = new FileCacheProvider();
        [
            '_getValue' ,
            '_getValues' ,
            '_setValue' ,
            '_setValues' ,
            '_deleteValue' ,
            '_deleteValues' ,
            '_load' ,
            '_save' ,
            '_clearValue'
        ].forEach(function(pro){
            var instanceRet =  ( typeof fileCacheProvider[ pro ] !== 'undefined' && typeof fileCacheProvider[pro] === 'function') ;
            var consRet = ( typeof FileCacheProvider[pro] === 'undefined' && typeof FileCacheProvider.prototype[pro] === 'function' ) ;
            it( '[ ' + pro + ']' , function(){
                assert.ok( instanceRet && consRet ) ;
            });
        }) ;
    });
});

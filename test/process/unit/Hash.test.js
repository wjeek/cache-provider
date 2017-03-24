var assert = require('assert');

var Hash = require('./index').Hash ;

describe('Hash [中间件基类]', function() {
    describe('Hash [属性检测]',function(){
        var hash = new Hash();
        [
            'value'
        ].forEach(function(attr){
            it( '[ ' + attr + ']' , function(){
                assert.ok( typeof hash[attr] !== 'undefined' );
            });
        }) ;
    });
    describe('Hash [原型检测]',function(){
        var hash = new Hash();
        [
            '_hashObject' ,
            '_hashArray',
            '_changeObj' ,
            'hash' ,
            'beforeset' ,
            'afterset' ,
            'beforeget' ,
            'afterget' ,
        ].forEach(function(pro){
            var instanceRet =  ( typeof hash[ pro ] !== 'undefined' && typeof hash[pro] === 'function') ;
            var consRet = ( typeof Hash[pro] === 'undefined' && typeof Hash.prototype[pro] === 'function' ) ;
            it( '[ ' + pro + ']' , function(){
                assert.ok( instanceRet && consRet ) ;
            });
        }) ;
    });
    describe('Hash.prototype.beforeset [Function]',function(){
        it('beforeet哈希key',function(){
            var hash = new Hash();
            var query = {
                key : 'foo1234567890123456' ,
                value : 'bar' ,
                meta : {}
            }
            hash.beforeset(query,function(){
                assert.notEqual(query.key,'foo1234567890123456');
            });
        });
    }) ;
    describe('Hash.prototype.beforeget [Function]',function(){
        it('beforeget能取到同key',function(){
            var hash = new Hash();
            var query = {
                key : 'foo1234567890123456' ,
                value : 'far' ,
                meta : {}
            }
            hash.beforeset(query,function(){
                var _tmpHash = query.key ;
                hash.afterget(query,function(){
                    assert.equal(query.key,_tmpHash);
                });
            });
        });
    }) ;
});

var assert = require('assert');

var Compression = require('./index').Compression ;

describe('Compression [中间件 - 压缩]', function() {
    describe('Compression [属性检测]',function(){
        var compression = new Compression();
        [
            '_options'
        ].forEach(function(attr){
            it( '[ ' + attr + ']' , function(){
                assert.ok( typeof compression[attr] !== 'undefined' );
            });
        }) ;
    });
    describe('Compression [原型检测]',function(){
        var compression = new Compression();
        [
            'beforeset',
            'afterget'
        ].forEach(function(pro){
            var instanceRet =  ( typeof compression[ pro ] !== 'undefined' && typeof compression[pro] === 'function') ;
            var consRet = ( typeof Compression[pro] === 'undefined' && typeof Compression.prototype[pro] === 'function' ) ;
            it( '[ ' + pro + ']' , function(){
                assert.ok( instanceRet && consRet ) ;
            });
        }) ;
    });
    describe('Compression.prototype.beforeset [Function]',function(){
        it('beforeet压缩value',function(){
            var compression = new Compression();
            var query = {
                value : 'far' ,
                meta : {}
            }
            compression.beforeset(query,function(){
                assert.notEqual(query.value,'far');
            });
        });
    }) ;
    describe('Compression.prototype.afterget [Function]',function(){
        it('afterget还原value',function(){
            var compression = new Compression();
            var query = {
                key : 'foo' ,
                value : 'far' ,
                meta : {}
            }
            compression.beforeset(query,function(){
                assert.notEqual(query.value,'far');
            });
            compression.afterget(query,function(){
                assert.equal(query.value,'far');
            });
        });
    }) ;
});

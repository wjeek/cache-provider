var assert = require('assert');

var BaseMiddleware = require('./index').BaseMiddleware ;

describe('BaseMiddleware [中间件基类]', function() {
    describe('BaseMiddleware [属性检测]',function(){
        var baseMiddleware = new BaseMiddleware();
        [
            '_options'
        ].forEach(function(attr){
            it( '[ ' + attr + ']' , function(){
                assert.ok( typeof baseMiddleware[attr] !== 'undefined' );
            });
        }) ;
    });
    describe('BaseMiddleware [原型检测]',function(){
        var baseMiddleware = new BaseMiddleware();
        [
            'process' ,
            'beforeget',
            'afterget' ,
            'beforeset' ,
            'afterset' ,
            'beforedelete' ,
            'afterdelete' ,
            'beforeclear' ,
            'afterclear'
        ].forEach(function(pro){
            var instanceRet =  ( typeof baseMiddleware[ pro ] !== 'undefined' && typeof baseMiddleware[pro] === 'function') ;
            var consRet = ( typeof BaseMiddleware[pro] === 'undefined' && typeof BaseMiddleware.prototype[pro] === 'function' ) ;
            it( '[ ' + pro + ']' , function(){
                assert.ok( instanceRet && consRet ) ;
            });
        }) ;
    });
});

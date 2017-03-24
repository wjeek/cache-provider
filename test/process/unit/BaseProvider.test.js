var assert = require('assert');

var BaseProvider = require('./index').BaseProvider ;

describe('BaseProvider [Provider基类]', function() {
    describe('BaseProvider [属性检测]',function(){
        var baseProvider = new BaseProvider();
        [
            '_name' ,
            '_maxLength' ,
            '_queue'
        ].forEach(function(attr){
            it( '[ ' + attr + ']' , function(){
                assert.ok( typeof baseProvider[attr] !== 'undefined' );
            });
        }) ;
    });
    describe('BaseProvider [原型检测]',function(){
        var baseProvider = new BaseProvider();
        [
            'get' ,
            'set' ,
            'delete' ,
            'clear' ,
            'start' ,
            'stop' ,
            '_getValue' ,
            '_getValues' ,
            '_setValue' ,
            '_setValues' ,
            '_deleteValue' ,
            '_clearValue' ,
            '_startProvider' ,
            '_stopProvider' ,
            '_load' ,
            '_save'
        ].forEach(function(pro){
            var instanceRet =  ( typeof baseProvider[ pro ] !== 'undefined' && typeof baseProvider[pro] === 'function') ;
            var consRet = ( typeof BaseProvider[pro] === 'undefined' && typeof BaseProvider.prototype[pro] === 'function' ) ;
            it( '[ ' + pro + ']' , function(){
                assert.ok( instanceRet && consRet ) ;
            });
        }) ;
    });
});

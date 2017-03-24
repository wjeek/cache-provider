var assert = require('assert');

var Validation = require('./index').Validation ;

describe('Validation [中间件基类]', function() {
    describe('Validation [属性检测]',function(){
        var validation = new Validation();
        [
            'reg'
        ].forEach(function(attr){
            it( '[ ' + attr + ']' , function(){
                assert.ok( typeof validation[attr] !== 'undefined' );
            });
        }) ;
    });
    describe('Validation [原型检测]',function(){
        var validation = new Validation();
        [
            '_isStringValid' ,
            '_isObjectValid',
            '_isArrayValid' ,
            'isValid' ,
            'beforeset' ,
            'afterset' ,
            'beforeget' ,
            'afterget' ,
        ].forEach(function(pro){
            var instanceRet =  ( typeof validation[ pro ] !== 'undefined' && typeof validation[pro] === 'function') ;
            var consRet = ( typeof Validation[pro] === 'undefined' && typeof Validation.prototype[pro] === 'function' ) ;
            it( '[ ' + pro + ']' , function(){
                assert.ok( instanceRet && consRet ) ;
            });
        }) ;
    });
    describe('Validation.prototype._isStringValid [Function]',function(){
        it('校验单个字符',function(){
            var validation = new Validation();
            var validRet1 = validation._isStringValid('foo',{

            });
            var validRet2 = !validation._isStringValid('bar',{
                minLength : 5
            });
            var validRet3 = !validation._isStringValid('foo',{
                reg : /^[0-1]+$/
            });
            assert.ok( validRet1 && validRet2 && validRet3 ) ;
        });
    }) ;
    describe('Validation.prototype._isObjectValid [Function]',function(){
        it('校验对象',function(){
            var validtion = new Validation();
            var validRet1 = validtion._isObjectValid({
                key : 'foo' ,
            },{
                key : {

                }
            });
            var validRet2 = !validtion._isObjectValid({
                key : 'foo' ,
                value : 'bar'
            },{
                key : {

                },
                value : {
                    minLength : 5
                }
            });
            var validRet3 = !validtion._isObjectValid({
                key : 'foo' ,
                value : 'bar'
            },{
                key : {

                },
                value : {
                    reg : /^[0-1]+$]/
                }
            });
            assert.ok( validRet1 && validRet2 && validRet3 ) ;
        });
    }) ;
    describe('Validation.prototype._isArrayValid [Function]',function(){
        it('检验整个数组中的对象',function(){
            var validtion = new Validation();
            var validRet = validtion._isArrayValid([
                {
                    key : 'foo' ,
                    value : 'bar' ,
                    value2 : '12345'
                },{
                    key : 'foo' ,
                    value : 'bar' ,
                    value2 : '12345'
                },{
                    key : 'foo' ,
                    value : 'bar' ,
                    value2 : '12345'
                }
            ],{
                key : {

                },
                value : {
                    minLength : 2 ,
                    maxLength : 4
                },
                value2 : {
                    reg : /^[0-9]+$/
                }
            });
            assert.ok( validRet ) ;
        });
    }) ;
    describe('Validation.prototype.isValid [Function]',function(){
        it('默认校验方法',function(){
            var validation = new Validation({
                key : {

                },
                value : {
                    minLength : 2 ,
                    maxLength : 4
                },
                value2 : {
                    reg : /^[0-9]+$/
                }
            });
            validation.isValid({
                key : 'foo' ,
                value : 'bar' ,
                value2 : '12345'
            },function(ret){
                assert.strictEqual( ret , null ) ;
            }) ;
        });
    }) ;
    describe('Validation.prototype.beforeget [Function]',function(){
        var validation = new Validation();
        it('beforeget',function(){
            validation.beforeget({
                key : 'foo' ,
                value : 'bar' ,
                value2 : '12345'
            },function(ret){
                assert.strictEqual( ret , null ) ;
            }) ;
        });
    }) ;
});

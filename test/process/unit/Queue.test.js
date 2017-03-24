var assert = require('assert');

var Queue = require('./index').Queue ;

describe('Queue [数据结构 - 缓存队列]', function() {
    describe('Queue [属性检测]',function(){
        var queue = new Queue({});
        [
            '_maxsize' ,
            '_delNum' ,
            '_length' ,
            '_sortWeight' ,
            '_queue'
        ].forEach(function(attr){
            it( '[ ' + attr + ']' , function(){
                assert.ok( typeof queue[attr] !== 'undefined' );
            });
        }) ;
    });
    describe('Queue [原型检测]',function(){
        var queue = new Queue({});
        [
            'get' ,
            'set' ,
            'delete' ,
            'reload' ,
            'save' ,
            'clear' ,
            'print' ,
            '_sortFunc'
        ].forEach(function(pro){
            var instanceRet =  ( typeof queue[ pro ] !== 'undefined' && typeof queue[pro] === 'function') ;
            var consRet = ( typeof Queue[pro] === 'undefined' && typeof Queue.prototype[pro] === 'function' ) ;
            it( '[ ' + pro + ']' , function(){
                assert.ok( instanceRet && consRet ) ;
            });
        }) ;
    });
    describe('Queue.prototype.set [Function]',function(){
        it('set',function(){
            var queue = new Queue({});
            queue.set([{
                key : 'bar' ,
                meta : {}
            }],function(){

            },true);
            queue.get({
                key : 'bar',
                meta : {}
            },function(err,ret){
                assert.ok( !err && !!ret.length ) ;
            },true);
        });
    }) ;
    describe('Queue.prototype.get [Function]',function(){
        it('get',function(){
            var queue = new Queue({});
            queue.set([{
                key : 'bar' ,
                meta : {}
            }],function(){

            },true);
            queue.get({
                key : 'bar' ,
                meta : {}
            },function(err,ret){
                assert.ok( !err && !!ret.length ) ;
            },true);
        });
        it('get不存在的值(期望找不到)',function(){
            var queue = new Queue({});
            queue.set([{
                key : 'bar' ,
                meta : {}
            }]);
            queue.get({
                key : 'foo' ,
                meta : {}
            },function(err,ret){
                assert.equal(0,ret.length);
            });
        });
    }) ;
    describe('Queue.prototype.delete [Function]',function(){
        it('delete',function(){
            var queue = new Queue({});
            queue.set([{
                key : 'bar' ,
                meta : {}
            },{
                key : 'foo' ,
                meta : {}
            }],function(){

            },true);
            var ret1 = false ;
            queue.get({
                key : 'bar' ,
                meta : {}
            },function(err,ret){
                ret1 = ( ret.length > 0 ) ;
            },true);
            queue.delete({
                key : 'bar' ,
                meta : {}
            });
            var ret2 = false ;
            queue.get({
                key : 'bar' ,
                meta : {}
            },function(err,ret){
                ret2 = ( ret.length === 0 );
            },true);
            assert.ok(ret1 && ret2) ;
        });
    }) ;
    describe('Queue.prototype.save [Function]',function(){
        it('save',function(){
            var queue = new Queue({});
            queue.set([{
                key : 'bar' ,
                meta : {}
            }],function(){

            },true);
            queue.set([{
                key : 'foo' ,
                meta : {}
            }],function(){

            },true);
            queue.save(function (map) {
                var _queue = map._queue ;
                assert.ok( !!_queue[ 'bar' ] && !!_queue[ 'foo' ] ) ;
            })
        });
    }) ;
    describe('Queue.prototype.clear [Function]',function(){
        it('clear',function(){
            var queue = new Queue({});
            queue.set([{
                key : 'bar' ,
                meta : {}
            }],function(){

            },true);
            queue.clear() ;
            queue.get({
                key : 'bar',
                meta : {}
            },function (isHas) {
                assert.ok( !isHas ) ;
            })
        });
    }) ;
});

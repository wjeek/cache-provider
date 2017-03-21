var crypto = require('crypto');
var BaseMiddleware = require('./BaseMiddleware');

/**
 *
 * 创建Hash构造方法
 * value为16或32
 */

function Hash(value) {
    BaseMiddleware.apply(this, arguments);
    if(value == 32){
        this.value = 32
    }
    else{
        this.value = 16;
    }
}
/**
 * 寄生组合继承BaseMiddleware
 */
(function(){
    var Super = function(){};
    Super.prototype = BaseMiddleware.prototype;
    Hash.prototype = new Super();
})();

/**
 * 扩展Hash原型链
 */
Hash.prototype = (function (fn) {
    /**
     *
     * @param key  需要处理的字符串或对象
     * 如：
     * {
     *      key:1232,
     *      ...
     * }
     * @param callback
     */
    fn._hashObject = function (key) {
        var data = key;
        if(Object.prototype.toString.call(key) == "[object Object]"){
            try{
                var k = key.key.toString();
            }catch(e){
                var k = JSON.stringify(key.key);
            }
            if(k && k.length> this.value){
                var md5 = crypto.createHash('md5');
                md5.update(k);
                if(this.value == 16){
                    data.key = md5.digest('hex').slice(8,24);
                }
                else{
                    data.key = md5.digest('hex');
                }
            }
            return data;
        }
        else {
            try{
                key = key.toString();
            }catch(e){
                key = JSON.stringify(key);
            }
            if(key.length>this.value){
                var md5 = crypto.createHash('md5');
                md5.update(key);
                if(this.value == 16){
                    data = md5.digest('hex').slice(8,24);
                }
                else{
                    data = md5.digest('hex');
                }
            }
            return data;
        }
    };

    /**
     * 
     * @param keyArray
     * 如
     * [
     *      {
     *          key:'2221'
     *          ...
     *      },
     *      {
     *          key:'12312312312',
     *          ...
     *      }
     *      
     * ]
     * @param callback
     * @private
     */
    fn._hashArray = function (keyArray) {
        var self = this;
        if(Object.prototype.toString.call(keyArray) == "[object Array]"){
            var data = keyArray;
            data.forEach(function (v,index) {
                try{
                    v = self._hashObject(v);
                }catch(e){
                    console.log(e)
                }
            })
            return data;
        }
        else{
            return keyArray;
        }
    }
    
    fn._changeObj = function (obj , objValue) {
        try{
            for(var i in objValue){
                obj[i] = objValue[i];
            }
        }catch (e){
            console.log(e);
        }
    }

    fn.hash = function (obj, next) {
        try{
            if(Object.prototype.toString.call(obj) == "[object Array]"){
                var afterObj = this._hashArray(obj); 
                this._changeObj(obj,afterObj);
                next(null);
            }
            else{
                var afterObj = this._hashObject(obj);
                this._changeObj(obj,afterObj);
                next(null);
            }
        }catch (e){
            console.log(e);
        }
    }


    fn.beforeset = fn.hash;

    fn.beforeget = fn.hash;

    return fn;
})(Hash.prototype)


/**
 * 暴露构造函数
 */
module.exports = Hash;
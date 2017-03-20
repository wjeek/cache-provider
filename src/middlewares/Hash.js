var crypto = require('crypto');
var BaseMiddleware = require('./BaseMiddleware');

/**
 *
 * 创建Hash构造方法
 */

function Hash() {
    BaseMiddleware.apply(this, arguments);
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
    fn.hashObject = function (key) {
        var data = key;
        if(Object.prototype.toString.call(key) == "[object Object]"){
            try{
                var k = key.key.toString();
            }catch(e){
                var k = JSON.stringify(key.key);
            }
            if(k && k.length>16){
                var md5 = crypto.createHash('md5');
                md5.update(k);
                data.key = md5.digest('hex').slice(8,24);
            }
            return data;
        }
        else {
            try{
                key = key.toString();
            }catch(e){
                key = JSON.stringify(key);
            }
            if(key.length>32){
                var md5 = crypto.createHash('md5');
                md5.update(key);
                data = md5.digest('hex').slice(8,24);
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
    fn.hashArray = function (keyArray) {
        if(Object.prototype.toString.call(keyArray) == "[object Array]"){
            var data = keyArray;
            data.forEach(function (v,index) {
                try{
                    var k = v.key.toString();
                }catch(e){
                    var k = JSON.stringify(v.key);
                }
                if(k && k.length>16){
                    var md5 = crypto.createHash('md5');
                    md5.update(k);
                    v.key = md5.digest('hex').slice(8,24);
                }
            })
            return data;
        }
        else{
            return keyArray;
        }
    }

    fn.hash = function (obj) {
        try{
            if(Object.prototype.toString.call(obj) == "[object Array]"){
                return this.hashArray(obj);
            }
            else{
                return this.hashObject(obj);
            }
        }catch (e){
            return obj;
        }
    }


    fn.beforeset = fn.hash;

    fn.afterset = fn.hash;

    fn.beforeget = fn.hash;

    fn.afterget = fn.hash;

    return fn;
})(Hash.prototype)


/**
 * 暴露构造函数
 */
module.exports = Hash;


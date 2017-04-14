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

Hash.prototype = Object.create(BaseMiddleware.prototype);
Hash.prototype.constructor = Hash;

/**
 * 扩展Hash原型链
 */
Hash.prototype = (function (fn) {
    fn._hashString = function (key) {
        try{
            var k = key.toString();
            if(k && k.length> this.value){
                var md5 = crypto.createHash('md5');
                md5.update(k);
                if(this.value == 16){
                    k = md5.digest('hex').slice(8,24);
                }
                else{
                    k = md5.digest('hex');
                }
                key = k;
            }
            return key;
        }catch (e){
            return key;
        }
    };
    /**
     *
     * @param key  需要处理的字符串或对象
     * 如：
     * {
     *      key:1232,
     *      ...
     * }
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
            });
            return data;
        }
        else{
            return keyArray;
        }
    };
    
    fn._changeObj = function (obj , objValue) {
        try{
            for(var i in objValue){
                obj[i] = objValue[i];
            }
        }catch (e){
            console.log(e);
        }
    };

    fn.hash = function (query, next) {
        try{
            if(Object.prototype.toString.call(query) == "[object Array]"){
                var obj = this._hashArray(query); 
                this._changeObj(query,obj);
                //next && next(null);
            }
            else{
                var obj = this._hashObject(query);
                this._changeObj(query,obj);
                //next && next(null);
            }
        }catch (e){
            console.log(e);
        }

        next && next(null);
    };


    fn.beforeset = fn.hash;

    fn.afterset = function (query , next){
        next && next(null);
    };

    fn.beforeget = function (query , next) {
        try{
            var self = this;
            if(Object.prototype.toString.call(query) == "[object Object]"){
                if(query.key){
                    if(Object.prototype.toString.call(query.key) == "[object Array]"){
                        if(query.key.length!=0){
                            query.key.forEach(function (v,index) {
                                query.key[index] = self._hashString(v);
                            });
                            //next && next(null);
                        }
                    }
                    else if(Object.prototype.toString.call(query.key) == "[object String]"){
                        query.key = self._hashString(query.key);
                        //next && next(null);
                    }
                }
            }

        }catch (e){
            console.log(e);
        }

        next && next(null);
    };

    fn.afterget = function (query , next){
        next && next(null);
    };

    return fn;
})(Hash.prototype);


/**
 * 暴露构造函数
 */
module.exports = Hash;
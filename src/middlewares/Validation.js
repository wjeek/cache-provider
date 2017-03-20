var Logger = require('./Logger');
var BaseMiddleware = require('./BaseMiddleware');


/**
 *
 * 创建Validation构造方法
 */

function Validation() {
    BaseMiddleware.apply(this, arguments);
}

/**
 * 寄生组合继承BaseMiddleware
 */
(function(){
    var Super = function(){};
    Super.prototype = BaseMiddleware.prototype;
    Validation.prototype = new Super();
})();

/**
 * 扩展Validation原型链
 */
Validation.prototype = (function (fn) {
    /**
     * 校验单个字符串
     * @param key 要校验的关键字
     * @param Regex 正则表达式或者对象
     * /^123$/
     * 或
     * {
     *      reg:/^123$/,
     *      minLength:3,
     *      MaxLength:3,
     * }
     * @returns {*}
     */
    fn.isValid = function ( key , Regex) {
        try{
            if(!Regex){
                if(key){
                    return true;
                }
                return false;
            }
            if(Object.prototype.toString.call(Regex) == "[object Object]"){
                var Reg = Regex.reg || /\s*/;
                var minLength = Regex.minLength || 1;
                var maxLength = Regex.maxLength || 1000;
                if(key.toString().length >= minLength && key.toString().length <= maxLength && Reg.test(key)){
                    return true;
                }
            }
            else{
                if(Regex.test(key)){
                    return true;
                }
            }
        }catch(e){
            console.log(e);
        }
    };

    /**
     * 校验对象
     * @param obj  要校验的对象
     * {
     *      a:1,
     *      b:2,
     * }
     * @param RegObj  校验规则也可直接写正则表达式校验key
     * {
     *      a:/^1$/
     *      b:{
     *          reg:/^1$/,
     *          minLength:1,
     *          maxLength:2
     *      }
     * }
     * @returns {*}
     */
    fn.isObjectValid = function ( obj , RegObj ) {
        try{
            if(!RegObj){
                if(obj && obj.key){
                    return true;
                }
                return false;
            }
            if(Object.prototype.toString.call(obj) != "[object Object]"){
                return false;
            }
            if(Object.prototype.toString.call(RegObj) == "[object Object]"){
                for( var v in RegObj) {
                    if(obj[v]){
                        if(Object.prototype.toString.call(RegObj[v]) == "[object Object]"){
                            var Reg = RegObj[v].reg || /\s*/;
                            var minLength = RegObj[v].minLength || 1;
                            var maxLength = RegObj[v].maxLength || 1000;
                            if(obj[v].toString().length < minLength || obj[v].toString().length > maxLength || !Reg.test(obj[v])){
                                return false;
                            }
                        }
                        else{
                            if(!RegObj[v].test(obj[v])){
                                return false;
                            }
                        }
                    }
                    else{
                        return false;
                    }
                };
                return true;
            }
            else{
                if(obj.key && RegObj.test(obj.key)){
                    return true;
                }
                else{
                    return false;
                }
            }
            
        }catch(e){
            console.log(e);
        }
    };

    /**
     *校验整个数组中的对象
     * @param obj  要校验的数组
     * [
     *  {
     *      a:1,
     *      b:2,
     *  }
     * ]
     * @param RegObj  校验规则也可直接写正则表达式校验key
     * {
     *      a:/^1$/
     *      b:{
     *          reg:/^1$/,
     *          minLength:1,
     *          maxLength:2
     *      }
     * }
     * @returns {*}
     */
    fn.isArrayValid = function (keyArray , RegObj) {
        var self = this;
        try{
            if(Object.prototype.toString.call(keyArray) == "[object Array]"){
                for( var v in keyArray) {
                    var $valid = false;
                    if(!self.isObjectValid(keyArray[v],RegObj)){
                        return false;
                    }
                };
                return true;
            }
            else{
                return false;
            }
        }
        catch (e){
            console.log(e);
        }
    };

    fn.beforeset = function () {

    }

    fn.afterset = function () {

    }
    
    fn.beforeget = function () {
        
    }
    
    fn.afterget = function () {
        
    }
    
    
    return fn;
    
})(Validation.prototype)


/**
 * 暴露构造函数
 */
module.exports = Validation;

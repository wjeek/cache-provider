var Logger = require('./Logger');
var BaseMiddleware = require('./BaseMiddleware');


/**
 *
 * reg为对象或数组['key','value']
 * 创建Validation构造方法
 */

function Validation(reg) {
    BaseMiddleware.apply(this, arguments);
    var self = this;
    this.reg ={};
    if(Object.prototype.toString.call(reg) == "[object Object]"){
        this.reg = reg;
    }
    else if(Object.prototype.toString.call(reg) == "[object Array]"){
        reg.forEach(function (v) {
            self.reg[v] = {
                minLength : 1
            }
        })
    }
    else{
        this.reg ={
            key : {
                minLength : 1
            },
            value :{
                minLength : 1
            }
        }
    }
}

/**
 * 寄生组合继承BaseMiddleware
 */
Validation.prototype = Object.create(BaseMiddleware.prototype);
Validation.prototype.constructor = Validation;

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
    fn._isStringValid = function ( key , Regex) {
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
                var maxLength = Regex.maxLength || 1000000;
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
    fn._isObjectValid = function ( obj , RegObj ) {
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
                            var maxLength = RegObj[v].maxLength || 1000000;
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
                }
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
    fn._isArrayValid = function (keyArray , RegObj) {
        var self = this;
        try{
            if(Object.prototype.toString.call(keyArray) == "[object Array]"){
                for( var v in keyArray) {
                    var $valid = false;
                    if(!self._isObjectValid(keyArray[v],RegObj)){
                        return false;
                    }
                }
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
    
    fn.isValid = function (query , next) {
        try {
            if(Object.prototype.toString.call(query) == "[object Object]"){
                if(this._isObjectValid(query,this.reg)){
                    //next && next(null);
                }
                else{
                    console.log('检验不合格');
                }
            }else  if(Object.prototype.toString.call(query) == "[object Array]"){
                if(this._isArrayValid(query,this.reg)){
                    //next && next(null);
                }
                else{
                    console.log('检验不合格');
                }
            }
        }catch (e){
            console.log(e);
        }

        next && next(null);
    };

    fn.beforeset = fn.isValid;

    fn.afterset = function (query , next){
        next && next(null);
    };
    
    fn.beforeget = function (query , next) {
        try {
            if(Object.prototype.toString.call(query) == "[object Object]"){
                if(query.key){
                    if(Object.prototype.toString.call(query.key) == "[object Array]"){
                        if(query.key.length!=0){
                            //next && next(null);
                        }
                        else{
                            console.log('检验不合格');
                        }
                    }
                    else if(Object.prototype.toString.call(query.key) == "[object String]"){
                        //next && next(null);
                    }
                    else{
                        console.log('检验不合格');
                    }
                }
                else{
                    console.log('检验不合格');
                }
            }
            else{
                console.log('检验不合格');
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
    
})(Validation.prototype);


/**
 * 暴露构造函数
 */
module.exports = Validation;
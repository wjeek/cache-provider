/**
 * Created by mars on 2017/3/10.
 * 日志模块
 */
var BaseMiddleware = require('./BaseMiddleware');
var log4js = require('log4js');

var config = require('../config/log4js');

/**
 * @Class Logger
 * @param options {Object}
 *        .method {string} log输出方式
 *        .level  {string} log输出级别
 *        .debug  {boolean}
 * @constructor
 */
function Logger(options) {
    BaseMiddleware.apply(this, arguments);
    if (!options) {
        options = {
            method: "console",
            level: "info",
            debug: true
        }
    }

    if (options.method != config.appenders[0].category && options.method != config.appenders[1].category && options.method != config.appenders[2].category) {
        options.method = config.appenders[0].category;
    }

    if (options.level != 'trace' && options.level != 'debug' && options.level != 'info' && options.level != 'warn' &&
        options.level != 'error' && options.level != 'fatal') {
        options.level = 'info';
    }


    this._method = options.method || "console";  //log输出方式
    this._level = options.level || "info";       //log输出级别:trace, debug, info, warn, error, fatal
    this._debug = options.debug || true;

    this._logger = this._init();

}

/**
 * extend basic class BaseMiddleware
 * @type {BaseMiddleware}
 */
Logger.prototype = Object.create(BaseMiddleware.prototype);
Logger.prototype.constructor = Logger;

Logger.prototype._init = function () {
    log4js.configure(config);
    var consoleLog = log4js.getLogger(this._method);
    return consoleLog;
};


/**
 *
 * @param query {Object}
 *              .action{String}         当前的处理逻辑（eg:get）
 *              .stage {String}         当前的处理逻辑阶段（eg:get前）
 *              .key   {String}         缓存数据的key
 *              .value {String/Object}  缓存数据的value
 *              .meta  {Object}         缓存数据的其它信息
 * @param next
 */

/**
 *
 * @param stage {String}                当前的处理逻辑阶段（eg:get前）
 * @param query {Object}
 *              .action{String}         当前的处理逻辑（eg:get）
 *              .key   {String}         缓存数据的key
 *              .value {String/Object}  缓存数据的value
 *              .meta  {Object}         缓存数据的其它信息
 * @param next
 */
Logger.prototype.process = function (stage, query, next) {
    if(Object.prototype.toString.call(query) == "[object Array]"){
        for(var i = 0;i<query.length;i++){

            if(Object.prototype.toString.call(query[i].value) == "[object Object]") {
                query[i].value = JSON.stringify(query[i].value);
            }
        }
        for(var i = 0;i<query.length;i++){
            this._logger[this._level]("生命周期：" + stage + ", action:" + query[i].action + ", query value:" + query[i].value + ", query key:" + query[i].key + ", query meta:" + JSON.stringify(query[i].meta));
        }
    }
    else{
        if(Object.prototype.toString.call(query.value) == "[object Object]") {
            query.value = JSON.stringify(query.value);
        }
        this._logger[this._level]("生命周期：" + stage + ", action:" + query.action + ", key:" + query.key + ", value:" + query.value + ", meta:" + JSON.stringify(query.meta));
    }
    next();
};

module.exports = Logger;
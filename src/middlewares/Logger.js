/**
 * Created by mars on 2017/3/10.
 * 日志模块
 */
var BaseMiddleware = require('./BaseMiddleware');
var log4js = require('log4js');

log4js.configure({
    //定义三个appender，一个是终端输出日志，一个是文件输出日志，一个是时间文件输出日志
    "appenders": [
        {
            "type": "console", //控制台输出
            "category": "console"
        },
        {
            "type": "file", //文件输出
            "filename": "../logs/log_file/file.log",
            "absolute": true,
            "maxLogSize": 1024,
            "backups": 3,
            "category": "log_file"
        },
        {
            "type": "dateFile", //按时间分文件输出
            "filename": "../logs/log_date/",
            "pattern": "yyyyMMddhh.txt",
            "absolute": true,
            "alwaysIncludePattern": true,
            "category": "log_date"   // 记录器名
        }
    ],
    "replaceConsole": true,
    "levels": {
        "console": "ALL",
        "log_file": "ALL",
        'log_date': "ALL"  // 设置记录器的默认显示级别，低于这个级别的日志，不会输出
    }
});

var consoleLog = log4js.getLogger("console");

var FileLog = log4js.getLogger("log_file");

var dateFileLog = log4js.getLogger("log_date");

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
    this._method = options.method || "console";  //log输出方式
    this._level = options.level || "info";       //log输出级别:trace, debug, info, warn, error, fatal
    this._debug = options.debug || true;
}

/**
 * extend basic class BaseMiddleware
 * @type {BaseMiddleware}
 */
Logger.prototype = Object.create(BaseMiddleware.prototype);
Logger.prototype.constructor = Logger;

// (function () {
//     var Super = function () {
//     };
//     Super.prototype = BaseMiddleware.prototype;
//     Logger.prototype = new Super();
// })();
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
Logger.prototype.process = function (query, next) {
    if (this._method == "console") {
        consoleLog[this._level]("生命周期：" + query.stage + ", key:" + query.key + ", value:" + query.value + ", meta:" + query.meta);

    } else if (this._method == "file") {
        FileLog[this._level]("生命周期：" + query.stage + ", key:" + query.key + ", value:" + query.value + ", meta:" + query.meta);
    } else if (this._method == "dateFile") {
        dateFileLog[this._level]("生命周期：" + query.stage + ", key:" + query.key + ", value:" + query.value + ", meta:" + query.meta);
    } else {
        consoleLog[this._level]("生命周期：" + query.stage + ", key:" + query.key + ", value:" + query.value + ", meta:" + query.meta);
    }
    next();
};

module.exports = Logger;
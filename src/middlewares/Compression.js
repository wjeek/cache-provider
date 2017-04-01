/**
 * Created by mars on 2017/3/10.
 * 压缩模块
 */
var zlib = require('zlib');
var BaseMiddleware = require('./BaseMiddleware');

/**
 * 构造方法
 * @param options {Object}
 *                    .algorithm : 'zip'
 *                    .compress : function | boolean
 *                    .decompress : function | boolean
 *
 * @constructor
 */
module.exports = Compression;

function Compression(options) {

    if (!(options && options.hasOwnProperty('algorithm') && options.hasOwnProperty('compress') && options.hasOwnProperty('decompress'))) {
        options = null;
    }
    options = options || {algorithm: 'zip', compress: true, decompress: true};
    BaseMiddleware.call(this, options);

    //初始化compress方法
    if (this._options.compress === true) {
        switch (this._options.algorithm) {
            //添加提供的压缩算法 case:
            default:
                this._options.compress = zipCompress;
                break;
        }
    }

    //初始化decompress算法
    if (this._options.decompress === true) {
        switch (this._options.algorithm) {
            //添加提供的解压缩算法 case
            default:
                this._options.decompress = zipDecompress;
                break;
        }
    }
}

Compression.prototype = Object.create(BaseMiddleware.prototype);
Compression.prototype.constructor = Compression;

Compression.prototype.beforeset = function (query, next) {
    var localQuery;
    if (isArray(query)) {
        localQuery = query;
    } else {
        localQuery = [query];
    }

    if (this._options.compress) { //如果压缩不为FALSE
        this._options.compress(localQuery[0].value, function (err, result) {
            if (err) {
                localQuery[0].meta.compressFail = true;
                console.error(err);
            } else {
                localQuery[0].value = result;
            }
            next();
        });
    } else {
        localQuery[0].meta.compressFail = true;
        next();
    }
};

Compression.prototype.afterget = function (query, next) {
    var localQuery;
    if (isArray(query)) {
        localQuery = query;
    } else {
        localQuery = [query];
    }

    if (!localQuery[0].meta.compressFail && this._options.decompress) { //如果压缩成功且需要解压缩
        this._options.decompress(localQuery[0].value, function (err, result) {
            if (err) {
                next(err);
            } else {
                localQuery[0].value = result;
                next();
            }
        });
    } else { //不需要解压缩
        next();
    }
}
;

/**
 * zip压缩、解压缩
 */
function zipCompress(data, callback) {
    var result;
    var error = null;
    try {
        result = zlib.gzipSync(JSON.stringify(data));
    } catch (err) {
        error = err;
    }
    callback(error, result);
}

function zipDecompress(data, callback) {
    var result;
    var error = null;
    try {
        result = JSON.parse(zlib.gunzipSync(data));
    } catch (err) {
        error = err;
    }
    callback(error, result);
}

function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}
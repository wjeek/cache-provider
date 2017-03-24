/**
 * Created by mars on 2017/3/10.
 * 压缩模块
 */
var zlib = require('zlib');
var BaseMiddleware = require('./BaseMiddleware');

/**
 * 构造方法
 * @param options string || {Object}
 *                'zip'     .algorithm : 'zip'
 *                          .compress : function
 *                          .decompress : function
 *
 * @constructor
 */
module.exports = Compression;

function Compression(options) {
    options = options || "zip";
    BaseMiddleware.call(this, options);

    if (typeof options == 'string') {
        this._options = {};
        switch (options) {
            /**
             * 添加自带的压缩算法 case :
             */

            default:
                this._options.algorithm = options;
                this._options.compress = zipCompress;
                this._options.decompress = zipDecompress;
                break;
        }
    }

    if (typeof options == "object") {
        this._options = options;

        if (!(typeof options.compress == "function")) {
            this._options.compress = function () {
            };
            console.error(this._options.algorithm + " 算法没有提供compress方法");
        }
        if (!(typeof options.decompress == "function")) {
            this._options.decompress = function () {
            };
            console.error(this._options.algorithm + " 算法没有提供decompress方法");
        }
    }
}

Compression.prototype = Object.create(BaseMiddleware.prototype);
Compression.prototype.constructor = Compression;

Compression.prototype.beforeset = function (query, next) {
    this._options.compress(query.value, function (err, result) {
        if (err) {
            query.meta.compressFail = true;
            console.error(err);
        } else {
            query.value = result;
        }
        next();
    });
};

Compression.prototype.afterget = function (query, next) {
    if (!query.meta.compressFail) {
        this._options.decompress(query.value, function (err, result) {
            if (err) {
                next(err);
            } else {
                query.value = result;
                next();
            }
        });
    }
};

/**
 * zip压缩、解压缩
 */
function zipCompress(data, callback) {
    var result;
    try {
        result = zlib.gzipSync(JSON.stringify(data));
    } catch (err) {
        callback(err);
    }
    callback(null, result);
}

function zipDecompress(data, callback) {
    var result;
    try {
        result = JSON.parse(zlib.gunzipSync(data));
    } catch (err) {
        callback(err);
    }
    callback(null, result);
}
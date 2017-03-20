/**
 * Created by mars on 2017/3/10.
 * 压缩模块
 */
var zlib = require('zlib');

var _algorithm;

function Compression(algorithm) {
    _algorithm = algorithm || new Huffman();
}

Compression.prototype.compress = function (source, callback) {
    var result;
    try {
        result = _algorithm.compress(source);
    } catch (err) {
        callback(err);
    }
    callback(null, result);
};

Compression.prototype.decompress = function (code, callback) {
    var result;
    try {
        result = _algorithm.decompress(code);
    } catch (err) {
        callback(err);
    }
    callback(null, result);
};

var test = new Compression();
test.compress('test', function (err, result) {
    if (err) {
        console.log(err);
    } else {
        console.log(result);
    }
});

test.decompress('test coded', function (err, result) {
    if (err) {
        console.log(err);
    } else {
        console.log(result);
    }
});
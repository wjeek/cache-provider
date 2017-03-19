/**
 * @Class BaseMiddleware
 */

Function.prototype.getName = function(){
    return this.name || this.toString().match(/function\s*([^(]*)\(/)[1]
}

function BaseMiddleware(options) {
    this.name = this.constructor.getName();
    this._options = Object.assign({}, options);
}

BaseMiddleware.prototype.process = function (src, callback) {
    var stage = src.stage || '';

    if (this[stage]) {
        this[stage](src, function (err, data) {
            callback(err, data);
        });
    } else {
        callback('', src);
    }
}

module.exports = BaseMiddleware;
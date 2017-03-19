var BaseMiddleware = require('./BaseMiddleware');
/**
 * @Class Format
 * @constructor
 * @param options {Object}
 */

function Format(options) {
    BaseMiddleware.apply(this, arguments);
}

Format.prototype = new BaseMiddleware();
Format.prototype.constructor = Format;

/**
 * handle key before get data from cache model
 * @method beforeGet
 * @param  src {Object}
 *              .key    {String}
 *              .action {String}
 * @param callback {Function}
 */

Format.prototype.beforeget = function (src, callback) {
    console.log('berfore get');
    callback(null, src);
}

Format.prototype.afterset = function (src, callback) {
    console.log('after set');
    callback(null, src);
}

module.exports = Format;

var BaseMiddleware = require('./BaseMiddleware');
/**
 * @Class Format
 * @constructor
 * @param options {Object}
 */

function Format(options) {
    BaseMiddleware.apply(this, arguments);
}

(function () {
    var Shell = function Shell() {

    };

    Shell.prototype = BaseMiddleware.prototype;

    Format.prototype = new Shell();
    Format.prototype.constructor = Format;
})();

/**
 * handle key before get data from cache model
 * @method beforeGet
 * @param  src {Object}
 *              .key    {String}
 *              .action {String}
 * @param callback {Function}
 */

Format.prototype.beforeget = function (src, next) {
    console.log('berfore get');
    next();
}

Format.prototype.afterset = function (src, next) {
    console.log('after set');
    next();
}

module.exports = Format;

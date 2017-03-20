/**
 * @Class BaseMiddleware
 */

Function.prototype.getName = function(){
    return this.name || this.toString().match(/function\s*([^(]*)\(/)[1]
}

/**
 * @Class BaseMiddleware
 * @constructor
 * @param options {Object}
 */
function BaseMiddleware(options) {
    this.name = this.constructor.getName();
    this._options = Object.assign({}, options);
}

/**
 * 处理经过中间件的数据
 * @method process
 * @param query {Object}
 *               .action
 *               .stage
 *               .key
 *               .value
 *               .meta
 * @param next {Funtionc}
 */
BaseMiddleware.prototype.process = function (query, next) {
    var stage = query.stage || '';

    if (this[stage]) {
        this[stage](query, next);
    } else {
        next();
    }
}

/**
 * 各生命周期中，中间件的处理逻辑
 * @method beforeget
 * @param query {Object}
 *               .action
 *               .stage
 *               .key
 *               .value
 *               .meta
 * @param next {Funtionc}
 */
BaseMiddleware.prototype.beforeget = function (query, next) {

}

BaseMiddleware.prototype.afterget = function (query, next) {

}

BaseMiddleware.prototype.beforeset = function (query, next) {

}

BaseMiddleware.prototype.afterset = function (query, next) {

}

BaseMiddleware.prototype.beforedelete = function (query, next) {

}

BaseMiddleware.prototype.afterdelete = function (query, next) {

}

BaseMiddleware.prototype.beforeclear = function (query, next) {

}

BaseMiddleware.prototype.afterclear = function (query, next) {

}

module.exports = BaseMiddleware;
